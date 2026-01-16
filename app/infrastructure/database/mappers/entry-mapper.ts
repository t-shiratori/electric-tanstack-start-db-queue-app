import type { Entry } from '~/domain/entry';
import type { DbEntry } from '../schemas';

/**
 * DB層からドメイン層への変換
 * snake_case -> camelCase
 *
 * @param dbEntry データベースのentryレコード
 * @returns ドメイン層のEntryエンティティ
 */
export function toDomainEntry(dbEntry: DbEntry): Entry {
  return {
    id: dbEntry.id,
    ticketNumber: dbEntry.number,
    createdAt: dbEntry.created_at,
    token: dbEntry.public_token,
  };
}

/**
 * ドメイン層からDB層への変換（INSERT用）
 * camelCase -> snake_case
 *
 * @param entry ドメイン層のEntryエンティティ
 * @param queueId 所属するキューのID
 * @param partySize パーティーサイズ（人数）
 * @returns データベースのentryレコード
 */
export function toDbEntry(entry: Entry, queueId: string, partySize: number = 1): DbEntry {
  return {
    id: entry.id,
    queue_id: queueId,
    number: entry.ticketNumber,
    party_size: partySize,
    public_token: entry.token,
    created_at: entry.createdAt,
  };
}
