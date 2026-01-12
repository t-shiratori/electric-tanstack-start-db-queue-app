import type { EntryState, EventActor } from './types'

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
