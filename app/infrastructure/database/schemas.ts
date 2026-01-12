import { z } from 'zod'

/**
 * UUID文字列のバリデーションスキーマ
 * RFC 4122準拠のUUIDを使用
 */
export const UuidSchema = z.uuid()
export type Uuid = z.infer<typeof UuidSchema>

/**
 * データベース層のentryテーブルスキーマ
 * PostgreSQLのテーブル構造に対応（snake_case）
 */
export const DbEntrySchema = z.object({
  id: UuidSchema,
  queue_id: UuidSchema,
  number: z.number().int().positive(),
  party_size: z.number().int().positive().default(1),
  public_token: z.string().length(8).regex(/^[A-Z0-9]+$/),
  created_at: z.date(),
})

export type DbEntry = z.infer<typeof DbEntrySchema>

/**
 * データベース層のentry_eventテーブルスキーマ
 * PostgreSQLのテーブル構造に対応（snake_case）
 */
export const DbEntryEventSchema = z.object({
  id: UuidSchema,
  entry_id: UuidSchema,
  type: z.enum(['created', 'called', 'done', 'skipped', 'cancelled']),
  created_at: z.date(),
  actor: z.enum(['staff', 'system', 'user']),
  device_id: z.string().nullable(),
})

export type DbEntryEvent = z.infer<typeof DbEntryEventSchema>

/**
 * サーバー関数用のバリデーションスキーマ（created_atなし）
 * サーバー側でcreated_atを自動設定するため
 */
export const InsertDbEntrySchema = DbEntrySchema.omit({ created_at: true })
export type InsertDbEntry = z.infer<typeof InsertDbEntrySchema>

export const InsertDbEntryEventSchema = DbEntryEventSchema.omit({ created_at: true })
export type InsertDbEntryEvent = z.infer<typeof InsertDbEntryEventSchema>

/**
 * JOINクエリの結果のバリデーションスキーマ
 * entry と entry_event の LEFT JOIN 結果を表現
 * PostgreSQLのTIMESTAMPTZ型は文字列として返されるため、z.coerce.date()で変換する
 */
export const JoinedEntryEventRowSchema = z.object({
  id: UuidSchema,
  ticketNumber: z.number().int().positive(),
  createdAt: z.coerce.date(),
  token: z.string().length(8),
  eventId: UuidSchema.nullable().optional(),
  eventType: z.enum(['created', 'called', 'done', 'skipped', 'cancelled']).nullable().optional(),
  eventCreatedAt: z.coerce.date().nullable().optional(),
  eventActor: z.enum(['staff', 'system', 'user']).nullable().optional(),
})

export type JoinedEntryEventRow = z.infer<typeof JoinedEntryEventRowSchema>
