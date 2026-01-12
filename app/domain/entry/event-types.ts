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
 * データベースのイベントタイプ定数
 * @property CREATED 作成
 * @property CALLED 呼び出し
 * @property DONE 完了
 * @property SKIPPED スキップ
 * @property CANCELLED キャンセル
 */
export const DB_EVENT_TYPE = {
  CREATED: 'created',
  CALLED: 'called',
  DONE: 'done',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
} as const satisfies Record<string, DbEventType>

/**
 * イベントタイプ変換マッピング
 */
export const EVENT_TYPE_MAPPING = {
  // Domain -> DB
  toDb: {
    [ENTRY_EVENT_TYPE.CREATED]: DB_EVENT_TYPE.CREATED,
    [ENTRY_EVENT_TYPE.CALLED]: DB_EVENT_TYPE.CALLED,
    [ENTRY_EVENT_TYPE.DONE]: DB_EVENT_TYPE.DONE,
    [ENTRY_EVENT_TYPE.SKIPPED]: DB_EVENT_TYPE.SKIPPED,
    [ENTRY_EVENT_TYPE.CANCELLED]: DB_EVENT_TYPE.CANCELLED,
  } as const,

  // DB -> Domain
  toDomain: {
    [DB_EVENT_TYPE.CREATED]: ENTRY_EVENT_TYPE.CREATED,
    [DB_EVENT_TYPE.CALLED]: ENTRY_EVENT_TYPE.CALLED,
    [DB_EVENT_TYPE.DONE]: ENTRY_EVENT_TYPE.DONE,
    [DB_EVENT_TYPE.SKIPPED]: ENTRY_EVENT_TYPE.SKIPPED,
    [DB_EVENT_TYPE.CANCELLED]: ENTRY_EVENT_TYPE.CANCELLED,
  } as const,
} as const

/**
 * イベントタイプをDBタイプに変換
 * @param eventType 変換元のエントリーイベントタイプ
 * @returns 変換後のデータベースイベントタイプ
 */
export function toDbEventType(eventType: EntryEventType): DbEventType {
  return EVENT_TYPE_MAPPING.toDb[eventType]
}

/**
 * DBタイプをイベントタイプに変換
 * @param dbType 変換元のデータベースイベントタイプ
 * @returns 変換後のエントリーイベントタイプ
 */
export function toDomainEventType(dbType: DbEventType): EntryEventType {
  return EVENT_TYPE_MAPPING.toDomain[dbType]
}
