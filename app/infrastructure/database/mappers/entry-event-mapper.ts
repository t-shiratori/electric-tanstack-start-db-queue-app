import type { EntryEvent } from '~/domain/entry'
import { toDbEventType, toDomainEventType } from '~/domain/entry'
import type { DbEntryEvent } from '../schemas'

/**
 * DB層からドメイン層への変換
 * snake_case -> camelCase
 * DB型 -> ドメイン型
 *
 * @param dbEvent データベースのentry_eventレコード
 * @returns ドメイン層のEntryEventエンティティ
 */
export function toDomainEntryEvent(dbEvent: DbEntryEvent): EntryEvent {
  return {
    id: dbEvent.id,
    entryId: dbEvent.entry_id,
    type: toDomainEventType(dbEvent.type),
    createdAt: dbEvent.created_at,
    actor: dbEvent.actor,
  }
}

/**
 * ドメイン層からDB層への変換（INSERT用）
 * camelCase -> snake_case
 * ドメイン型 -> DB型
 *
 * @param event ドメイン層のEntryEventエンティティ
 * @param deviceId デバイスID（オプション）
 * @returns データベースのentry_eventレコード
 */
export function toDbEntryEvent(
  event: EntryEvent,
  deviceId?: string | null
): DbEntryEvent {
  return {
    id: event.id,
    entry_id: event.entryId,
    type: toDbEventType(event.type),
    created_at: event.createdAt,
    actor: event.actor,
    device_id: deviceId ?? null,
  }
}
