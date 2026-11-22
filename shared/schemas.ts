import { z } from 'zod';

/**
 * クライアント（app/）とサーバー（server/）で共有するZodスキーマ
 *
 * どちらの実行環境にも依存しない（import.meta.env や pg を参照しない）ため、
 * ブラウザ・Node.js の両方から安全にインポートできる。
 */

/**
 * UUID文字列のバリデーションスキーマ
 * RFC 4122準拠のUUIDを使用
 */
export const UuidSchema = z.uuid();
export type Uuid = z.infer<typeof UuidSchema>;

/**
 * データベース層のイベントタイプ配列
 * PostgreSQLのCHECK制約の値に対応
 */
export const DB_EVENT_TYPES = ['created', 'called', 'done', 'skipped', 'cancelled'] as const;

/**
 * イベント実行者の種類配列
 */
export const EVENT_ACTORS = ['staff', 'system', 'user'] as const;

/**
 * データベース層のentryテーブルスキーマ
 * PostgreSQLのテーブル構造に対応（snake_case）
 */
export const DbEntrySchema = z.object({
  id: UuidSchema,
  queue_id: UuidSchema,
  number: z.number().int().positive(),
  party_size: z.number().int().positive().default(1),
  public_token: z
    .string()
    .length(8)
    .regex(/^[A-Z0-9]+$/),
  created_at: z.date(),
});

export type DbEntry = z.infer<typeof DbEntrySchema>;

/**
 * データベース層のentry_eventテーブルスキーマ
 * PostgreSQLのテーブル構造に対応（snake_case）
 */
export const DbEntryEventSchema = z.object({
  id: UuidSchema,
  entry_id: UuidSchema,
  type: z.enum(DB_EVENT_TYPES),
  created_at: z.date(),
  actor: z.enum(EVENT_ACTORS),
  device_id: z.string().nullable(),
});

export type DbEntryEvent = z.infer<typeof DbEntryEventSchema>;

/**
 * エントリー挿入（tRPC）の入力スキーマ
 * - created_at はサーバーで now() を設定する
 * - number（整理券番号）は競合を防ぐためサーバーで採番する
 */
export const InsertDbEntrySchema = DbEntrySchema.omit({ created_at: true, number: true });
export type InsertDbEntry = z.infer<typeof InsertDbEntrySchema>;

/**
 * エントリーイベント挿入（tRPC）の入力スキーマ
 * created_at はサーバーで now() を設定する
 */
export const InsertDbEntryEventSchema = DbEntryEventSchema.omit({
  created_at: true,
});
export type InsertDbEntryEvent = z.infer<typeof InsertDbEntryEventSchema>;
