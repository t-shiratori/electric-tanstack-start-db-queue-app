import { ENTRY_STATE } from './constants';
import { ENTRY_EVENT_TYPE } from './event-types';
import type { EntryEvent, EntryEventType, EntryState } from './types';

/**
 * イベントタイプから状態への変換マッピング
 * イベントソーシングパターンの状態導出ルール
 */
const EVENT_TYPE_TO_STATE: Record<EntryEventType, EntryState> = {
  [ENTRY_EVENT_TYPE.CREATED]: ENTRY_STATE.WAITING,
  [ENTRY_EVENT_TYPE.CALLED]: ENTRY_STATE.CALLED,
  [ENTRY_EVENT_TYPE.DONE]: ENTRY_STATE.DONE,
  [ENTRY_EVENT_TYPE.SKIPPED]: ENTRY_STATE.SKIPPED,
  [ENTRY_EVENT_TYPE.CANCELLED]: ENTRY_STATE.CANCELLED,
} as const;

/**
 * イベントソーシング: イベント履歴から現在の状態を導出
 * ドメインロジックの中核
 *
 * このロジックは：
 * - フレームワークに依存しない純粋な関数
 * - イベントの配列から現在の状態を計算
 * - 最新のイベントが優先される
 *
 * @param events エントリーに関連するイベント配列
 * @returns 導出された現在の状態
 */
export function calculateCurrentState(events: EntryEvent[]): EntryState {
  if (events.length === 0) {
    return ENTRY_STATE.WAITING;
  }

  // イベントを作成時刻でソート（新しい順）
  const sortedEvents = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // 最新のイベントから状態を導出
  const latestEvent = sortedEvents[0];
  return EVENT_TYPE_TO_STATE[latestEvent.type];
}

/**
 * 状態遷移が有効かを検証
 *
 * ビジネスルール：
 * - 終了状態（done, cancelled）からは遷移不可
 * - waiting -> called, cancelled
 * - called -> done, skipped, cancelled
 * - skipped -> 遷移不可（終了状態として扱う）
 *
 * @param currentState 現在の状態
 * @param eventType 適用しようとしているイベント
 * @returns 遷移が有効ならtrue
 */
export function isValidStateTransition(currentState: EntryState, eventType: EntryEventType): boolean {
  const nextState = EVENT_TYPE_TO_STATE[eventType];

  // 終了状態からの遷移は不可
  const finalStates: EntryState[] = [ENTRY_STATE.DONE, ENTRY_STATE.CANCELLED, ENTRY_STATE.SKIPPED];

  if (finalStates.includes(currentState)) {
    return false;
  }

  // waiting状態からの有効な遷移
  if (currentState === ENTRY_STATE.WAITING) {
    return nextState === ENTRY_STATE.CALLED || nextState === ENTRY_STATE.CANCELLED;
  }

  // called状態からの有効な遷移
  if (currentState === ENTRY_STATE.CALLED) {
    return nextState === ENTRY_STATE.DONE || nextState === ENTRY_STATE.SKIPPED || nextState === ENTRY_STATE.CANCELLED;
  }

  return false;
}

/**
 * イベント追加可否の判定結果
 * @property valid 追加してよいならtrue
 * @property currentState 判定に使った現在の状態
 */
export interface EventAppendCheck {
  valid: boolean;
  currentState: EntryState;
}

/**
 * 既存のイベント履歴に新しいイベントを追加してよいかを判定
 * クライアント（楽観的更新の前）とサーバー（書き込み時）の両方で同じルールを使う
 *
 * ビジネスルール：
 * - EntryCreated はイベントが1件もないときだけ追加できる
 * - それ以外は isValidStateTransition の遷移ルールに従う
 *
 * @param events エントリーに関連する既存のイベント配列
 * @param eventType 追加しようとしているイベント
 * @returns 判定結果
 */
export function checkEventAppend(events: EntryEvent[], eventType: EntryEventType): EventAppendCheck {
  const currentState = calculateCurrentState(events);

  if (eventType === ENTRY_EVENT_TYPE.CREATED) {
    return { valid: events.length === 0, currentState };
  }

  return { valid: isValidStateTransition(currentState, eventType), currentState };
}
