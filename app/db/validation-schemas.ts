import { z } from 'zod'
import { DB_EVENT_TYPES, EVENT_ACTORS } from './const'

/**
 * UUID文字列のバリデーションスキーマ
 * RFC 4122準拠のUUIDを使用
 */
export const UuidValidationSchema = z.uuid()
export type Uuid = z.infer<typeof UuidValidationSchema>

/**
 * エントリーのバリデーションスキーマ
 */
export const EntryValidationSchema = z.object({
  id: UuidValidationSchema,
  queue_id: UuidValidationSchema,
  number: z.number().int().positive(),
  party_size: z.number().int().positive().default(1),
  public_token: z.string().length(8).regex(/^[A-Z0-9]+$/),
  created_at: z.date(),
})

export type Entry = z.infer<typeof EntryValidationSchema>

/**
 * エントリーイベントのバリデーションスキーマ
 */
export const EntryEventValidationSchema = z.object({
  id: UuidValidationSchema,
  entry_id: UuidValidationSchema,
  type: z.enum(['created', 'called', 'done', 'skipped', 'cancelled']),
  created_at: z.date(),
  actor: z.enum(['staff', 'system', 'user']),
  device_id: z.string().nullable(),
})

export type EntryEvent = z.infer<typeof EntryEventValidationSchema>

/**
 * サーバー関数用のバリデーションスキーマ（created_atなし）
 */
export const InsertEntryValidationSchema = EntryValidationSchema.omit({ created_at: true })
export type InsertEntry = z.infer<typeof InsertEntryValidationSchema>

export const InsertEntryEventValidationSchema = EntryEventValidationSchema.omit({ created_at: true })
export type InsertEntryEvent = z.infer<typeof InsertEntryEventValidationSchema>

/**
 * JOINクエリの結果のバリデーションスキーマ
 * PostgreSQLのTIMESTAMPTZ型は文字列として返されるため、z.coerce.date()で変換する
 */
export const JoinedEntryEventRowSchema = z.object({
  id: UuidValidationSchema,
  ticketNumber: z.number().int().positive(),
  createdAt: z.coerce.date(),
  token: z.string().length(8),
  eventId: UuidValidationSchema.nullable().optional(),
  eventType: z.enum(DB_EVENT_TYPES).nullable().optional(),
  eventCreatedAt: z.coerce.date().nullable().optional(),
  eventActor: z.enum(EVENT_ACTORS).nullable().optional(),
})

export type JoinedEntryEventRow = z.infer<typeof JoinedEntryEventRowSchema>
