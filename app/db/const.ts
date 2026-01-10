import type { DbEventType, EntryEventType, EntryState, EventActor } from './types'

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

export const DB_EVENT_TYPES = [
  DB_EVENT_TYPE.CREATED,
  DB_EVENT_TYPE.CALLED,
  DB_EVENT_TYPE.DONE,
  DB_EVENT_TYPE.SKIPPED,
  DB_EVENT_TYPE.CANCELLED,
] as const

/**
 * アプリケーションのイベントタイプ定数
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
 * エントリーの状態定数
 * @property WAITING 待機中
 * @property CALLED 呼び出し済み
 * @property DONE 完了
 * @property SKIPPED スキップ
 * @property CANCELLED キャンセル
 */
export const ENTRY_STATE = {
  WAITING: 'waiting',
  CALLED: 'called',
  DONE: 'done',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
} as const satisfies Record<string, EntryState>

/**
 * イベント実行者の種類定数
 * @property STAFF スタッフ
 * @property SYSTEM システム
 * @property USER ユーザー
 */
export const EVENT_ACTOR = {
  STAFF: 'staff',
  SYSTEM: 'system',
  USER: 'user',
} as const satisfies Record<string, EventActor>

export const EVENT_ACTORS = [
  EVENT_ACTOR.STAFF,
  EVENT_ACTOR.SYSTEM,
  EVENT_ACTOR.USER,
] as const

/**
 * DbEventTypeからEntryEventTypeへの変換マッピング
 */
export const DB_EVENT_TYPE_TO_ENTRY_EVENT_TYPE: Record<DbEventType, EntryEventType> = {
  [DB_EVENT_TYPE.CREATED]: ENTRY_EVENT_TYPE.CREATED,
  [DB_EVENT_TYPE.CALLED]: ENTRY_EVENT_TYPE.CALLED,
  [DB_EVENT_TYPE.DONE]: ENTRY_EVENT_TYPE.DONE,
  [DB_EVENT_TYPE.SKIPPED]: ENTRY_EVENT_TYPE.SKIPPED,
  [DB_EVENT_TYPE.CANCELLED]: ENTRY_EVENT_TYPE.CANCELLED,
} as const

/**
 * EntryEventTypeからEntryStateへの変換マッピング
 */
export const ENTRY_EVENT_TYPE_TO_STATE: Record<EntryEventType, EntryState> = {
  [ENTRY_EVENT_TYPE.CREATED]: ENTRY_STATE.WAITING,
  [ENTRY_EVENT_TYPE.CALLED]: ENTRY_STATE.CALLED,
  [ENTRY_EVENT_TYPE.DONE]: ENTRY_STATE.DONE,
  [ENTRY_EVENT_TYPE.SKIPPED]: ENTRY_STATE.SKIPPED,
  [ENTRY_EVENT_TYPE.CANCELLED]: ENTRY_STATE.CANCELLED,
} as const
