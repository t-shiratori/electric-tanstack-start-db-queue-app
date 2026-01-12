import type { EntryEventType } from './types'

/**
 * アプリケーション層のイベントタイプ定数（ドメインイベント）
 * @property CREATED エントリー作成
 * @property CALLED エントリー呼び出し
 * @property DONE エントリー完了
 * @property SKIPPED エントリースキップ
 * @property CANCELLED エントリーキャンセル
 */
export const ENTRY_EVENT_TYPE = {
  CREATED: 'EntryCreated',
  CALLED: 'EntryCalled',
  DONE: 'EntryDone',
  SKIPPED: 'EntrySkipped',
  CANCELLED: 'EntryCancelled',
} as const satisfies Record<string, EntryEventType>

/**
 * データベース層のイベントタイプ
 * PostgreSQLのenum値に対応
 */
export type DbEventType = 'created' | 'called' | 'done' | 'skipped' | 'cancelled'

/**
 * イベントタイプをDBタイプに変換
 * @param eventType 変換元のエントリーイベントタイプ
 * @returns 変換後のデータベースイベントタイプ
 */
export function toDbEventType(eventType: EntryEventType): DbEventType {
  const mapping: Record<EntryEventType, DbEventType> = {
    [ENTRY_EVENT_TYPE.CREATED]: 'created',
    [ENTRY_EVENT_TYPE.CALLED]: 'called',
    [ENTRY_EVENT_TYPE.DONE]: 'done',
    [ENTRY_EVENT_TYPE.SKIPPED]: 'skipped',
    [ENTRY_EVENT_TYPE.CANCELLED]: 'cancelled',
  }
  return mapping[eventType]
}

/**
 * DBタイプをイベントタイプに変換
 * @param dbType 変換元のデータベースイベントタイプ
 * @returns 変換後のエントリーイベントタイプ
 */
export function toDomainEventType(dbType: DbEventType): EntryEventType {
  const mapping: Record<DbEventType, EntryEventType> = {
    'created': ENTRY_EVENT_TYPE.CREATED,
    'called': ENTRY_EVENT_TYPE.CALLED,
    'done': ENTRY_EVENT_TYPE.DONE,
    'skipped': ENTRY_EVENT_TYPE.SKIPPED,
    'cancelled': ENTRY_EVENT_TYPE.CANCELLED,
  }
  return mapping[dbType]
}
