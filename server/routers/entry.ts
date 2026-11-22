import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  checkEventAppend,
  type DbEventType,
  ENTRY_STATE_LABEL,
  type EntryEvent,
  toDomainEventType,
} from '../../app/domain/entry';
import {
  DB_EVENT_TYPES,
  EVENT_ACTORS,
  InsertDbEntryEventSchema,
  InsertDbEntrySchema,
  UuidSchema,
} from '../../shared/schemas';
import { withTransaction } from '../database/transaction';
import { publicProcedure, router } from '../trpc/init';

/**
 * INSERT ... RETURNING で受け取るエントリーの行
 * @property number 採番された整理券番号
 * @property txid PostgreSQLのトランザクションID（Electricの同期待ちに使う）
 */
const InsertedEntryRowSchema = z.object({
  number: z.number().int().positive(),
  txid: z.coerce.number().int(),
});

/**
 * INSERT ... RETURNING で受け取るトランザクションID
 */
const TxidRowSchema = z.object({
  txid: z.coerce.number().int(),
});

/**
 * 既存イベントの行（状態遷移の判定用）
 * actor はDB上NULLを許容するため、NULLは既定値の staff として扱う
 */
const EventRowSchema = z.object({
  id: UuidSchema,
  type: z.enum(DB_EVENT_TYPES),
  created_at: z.date(),
  actor: z.enum(EVENT_ACTORS).nullable(),
});

/**
 * イベント種別のログ用の表示名
 */
const EVENT_TYPE_LABEL = {
  created: '受付',
  called: '呼び出し',
  done: '完了',
  skipped: 'スキップ',
  cancelled: 'キャンセル',
} as const satisfies Record<DbEventType, string>;

/**
 * DBのイベント行をドメインのイベントに変換する
 * @param row DBから取得した行
 * @param entryId エントリーID
 * @returns ドメインのイベント
 */
function toDomainEvent(row: unknown, entryId: string): EntryEvent {
  const parsed = EventRowSchema.parse(row);
  return {
    id: parsed.id,
    entryId,
    type: toDomainEventType(parsed.type),
    createdAt: parsed.created_at,
    actor: parsed.actor ?? 'staff',
  };
}

/**
 * エントリー関連のtRPCルーター
 * PostgreSQLへのエントリーとイベントの書き込みを担当
 */
export const entryRouter = router({
  /**
   * エントリー挿入
   * 待ち行列の行をロックした上で整理券番号を採番し、同じトランザクションでINSERTする
   * これにより同時に発行されても番号が重複せず、どちらの発行も成功する
   */
  insert: publicProcedure.input(InsertDbEntrySchema).mutation(async ({ input, ctx }) => {
    const { id, queue_id, party_size, public_token } = input;

    const inserted = await withTransaction(ctx.pool, async (client) => {
      const queue = await client.query('SELECT id FROM queue WHERE id = $1 FOR UPDATE', [queue_id]);
      if (queue.rowCount === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '待ち行列が見つかりません' });
      }

      const result = await client.query(
        `INSERT INTO entry (id, queue_id, number, party_size, public_token, created_at)
         SELECT $1, $2, COALESCE(MAX(number), 0) + 1, $3, $4, now() FROM entry WHERE queue_id = $2
         RETURNING number, pg_current_xact_id()::text AS txid`,
        [id, queue_id, party_size, public_token],
      );
      return InsertedEntryRowSchema.parse(result.rows[0]);
    });

    console.log('='.repeat(60));
    console.log('[tRPC] 整理券発行');
    console.log('='.repeat(60));
    console.log(`整理券番号: ${inserted.number}`);
    console.log(`人数: ${party_size}名`);
    console.log(`トークン: ${public_token}`);
    console.log(`エントリーID: ${id}`);
    console.log(`キューID: ${queue_id}`);
    console.log(`発行時刻: ${new Date().toLocaleString('ja-JP')}`);
    console.log(`[tRPC] エントリー書き込み成功 (txid: ${inserted.txid})`);
    console.log('='.repeat(60));

    return { txid: inserted.txid, number: inserted.number, success: true };
  }),

  /**
   * エントリーイベント挿入
   * エントリーの行をロックした上で現在の状態を求め、状態遷移ルールに合う場合だけINSERTする
   * これにより別端末とのすれ違い（キャンセル済みの受付を完了にする等）を防ぐ
   */
  insertEvent: publicProcedure.input(InsertDbEntryEventSchema).mutation(async ({ input, ctx }) => {
    const { id, entry_id, type, actor, device_id } = input;

    const txid = await withTransaction(ctx.pool, async (client) => {
      const entry = await client.query('SELECT id FROM entry WHERE id = $1 FOR UPDATE', [entry_id]);
      if (entry.rowCount === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'エントリーが見つかりません' });
      }

      const existing = await client.query('SELECT id, type, created_at, actor FROM entry_event WHERE entry_id = $1', [
        entry_id,
      ]);
      const events = existing.rows.map((row) => toDomainEvent(row, entry_id));
      const check = checkEventAppend(events, toDomainEventType(type));
      if (!check.valid) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `現在の状態（${ENTRY_STATE_LABEL[check.currentState]}）からはこの操作を実行できません`,
        });
      }

      const result = await client.query(
        `INSERT INTO entry_event (id, entry_id, type, created_at, actor, device_id)
         VALUES ($1, $2, $3, now(), $4, $5)
         RETURNING pg_current_xact_id()::text AS txid`,
        [id, entry_id, type, actor, device_id || null],
      );
      return TxidRowSchema.parse(result.rows[0]).txid;
    });

    console.log(
      `[tRPC] イベント記録: ${EVENT_TYPE_LABEL[type]} (${actor}${device_id ? `, デバイス: ${device_id}` : ''}) txid: ${txid}`,
    );
    return { txid, success: true };
  }),
});
