import { InsertDbEntryEventSchema, InsertDbEntrySchema } from '../database/schemas';
import { publicProcedure, router } from '../trpc/init';

/**
 * エントリー関連のtRPCルーター
 * PostgreSQLへのエントリーとイベントの書き込みを担当
 */
export const entryRouter = router({
  /**
   * エントリー挿入
   * PostgreSQLに直接INSERTし、トランザクションIDを返す
   */
  insert: publicProcedure.input(InsertDbEntrySchema).mutation(async ({ input, ctx }) => {
    const { id, queue_id, number, party_size, public_token } = input;

    console.log('='.repeat(60));
    console.log('[tRPC] 整理券発行');
    console.log('='.repeat(60));
    console.log(`整理券番号: ${number}`);
    console.log(`人数: ${party_size}名`);
    console.log(`トークン: ${public_token}`);
    console.log(`エントリーID: ${id}`);
    console.log(`キューID: ${queue_id}`);
    console.log(`発行時刻: ${new Date().toLocaleString('ja-JP')}`);

    const result = await ctx.pool.query(
      'INSERT INTO entry (id, queue_id, number, party_size, public_token, created_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING (SELECT pg_current_xact_id()::text as txid)',
      [id, queue_id, number, party_size, public_token],
    );

    const txid = Number.parseInt(result.rows[0]?.txid || '0', 10);
    console.log(`[tRPC] エントリー書き込み成功 (txid: ${txid})`);
    console.log('='.repeat(60));
    return { txid, success: true };
  }),

  /**
   * エントリーイベント挿入
   * PostgreSQLに直接INSERTし、トランザクションIDを返す
   */
  insertEvent: publicProcedure.input(InsertDbEntryEventSchema).mutation(async ({ input, ctx }) => {
    const { id, entry_id, type, actor, device_id } = input;

    const eventTypeMap: Record<string, string> = {
      created: '受付',
      called: '呼び出し',
      done: '完了',
      skipped: 'スキップ',
      cancelled: 'キャンセル',
    };

    console.log(
      `[tRPC] イベント記録: ${eventTypeMap[type] || type} (${actor}${device_id ? `, デバイス: ${device_id}` : ''})`,
    );

    const result = await ctx.pool.query(
      'INSERT INTO entry_event (id, entry_id, type, created_at, actor, device_id) VALUES ($1, $2, $3, now(), $4, $5) RETURNING (SELECT pg_current_xact_id()::text as txid)',
      [id, entry_id, type, actor, device_id || null],
    );

    const txid = Number.parseInt(result.rows[0]?.txid || '0', 10);
    console.log(`[tRPC] イベント記録成功 (txid: ${txid})`);
    return { txid, success: true };
  }),
});
