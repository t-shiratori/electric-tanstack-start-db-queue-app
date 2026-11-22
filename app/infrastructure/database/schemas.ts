import { z } from 'zod';
import { DB_EVENT_TYPES, EVENT_ACTORS, UuidSchema } from '../../../shared/schemas';

/**
 * テーブル定義のスキーマはサーバーと共有するため shared/schemas.ts で定義している
 */
export {
  type DbEntry,
  type DbEntryEvent,
  DbEntryEventSchema,
  DbEntrySchema,
  type InsertDbEntry,
  type InsertDbEntryEvent,
  InsertDbEntryEventSchema,
  InsertDbEntrySchema,
  type Uuid,
  UuidSchema,
} from '../../../shared/schemas';

/**
 * JOINクエリの結果のバリデーションスキーマ（クライアント専用）
 * entry と entry_event の LEFT JOIN 結果を表現
 * 日時は Electric の parser で Date に変換済みだが、念のため z.coerce.date() で Date にそろえる
 */
export const JoinedEntryEventRowSchema = z.object({
  id: UuidSchema,
  ticketNumber: z.number().int().positive(),
  createdAt: z.coerce.date(),
  token: z.string().length(8),
  eventId: UuidSchema.nullable().optional(),
  eventType: z.enum(DB_EVENT_TYPES).nullable().optional(),
  eventCreatedAt: z.coerce.date().nullable().optional(),
  eventActor: z.enum(EVENT_ACTORS).nullable().optional(),
});

export type JoinedEntryEventRow = z.infer<typeof JoinedEntryEventRowSchema>;
