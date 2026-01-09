/**
 * イベント実行者の種類
 * - staff: スタッフ
 * - system: システム
 * - user: ユーザー
 */
export type EventActor = 'staff' | 'system' | 'user'

/**
 * エントリーイベントタイプ
 * イベントソーシングパターンで使用するイベントの種類
 * - EntryCreated: エントリー作成（初期状態）
 * - EntryCalled: エントリー呼び出し
 * - EntryDone: エントリー完了
 * - EntrySkipped: エントリースキップ
 * - EntryCancelled: エントリーキャンセル
 */
export type EntryEventType =
  | 'EntryCreated'
  | 'EntryCalled'
  | 'EntryDone'
  | 'EntrySkipped'
  | 'EntryCancelled'

/**
 * データベースのイベントタイプ
 * PostgreSQLのenum値に対応
 */
export type DbEventType = 'created' | 'called' | 'done' | 'skipped' | 'cancelled'

/**
 * EntryEventTypeをDbEventTypeに変換
 * 型安全な変換マッピング
 */
export function toDbEventType(eventType: EntryEventType): DbEventType {
  const mapping: Record<EntryEventType, DbEventType> = {
    EntryCreated: 'created',
    EntryCalled: 'called',
    EntryDone: 'done',
    EntrySkipped: 'skipped',
    EntryCancelled: 'cancelled',
  }
  return mapping[eventType]
}

/**
 * エントリーコレクションスキーマ
 * 不変属性のみを含む（作成後変更されない）
 * - 状態は含まない（イベントから導出）
 * - Electric SQLで同期される正のデータ
 */
export interface EntrySchema {
  /** エントリーID（UUID） */
  id: string
  /** 整理券番号 */
  ticketNumber: number
  /** 作成日時 */
  createdAt: Date
  /** スマホアクセス用のユニークトークン */
  token: string
}

/**
 * エントリーイベントコレクションスキーマ
 * イベントソーシングパターンで使用するイベントログ
 * - 追記専用（Append-only）
 * - 状態変更の履歴を保持
 * - Electric SQLで同期される
 */
export interface EntryEventSchema {
  /** イベントID（UUID） */
  id: string
  /** 関連するエントリーのID */
  entryId: string
  /** イベントタイプ */
  type: EntryEventType
  /** イベント発生日時 */
  createdAt: Date
  /** イベント実行者（staff: スタッフ, system: システム, user: ユーザー） */
  actor: 'staff' | 'system' | 'user'
}

/**
 * エントリーの状態
 * イベントから導出される計算結果（保存されない）
 * - waiting: 待機中（初期状態）
 * - called: 呼び出し済み
 * - done: 完了
 * - skipped: スキップ
 * - cancelled: キャンセル
 */
export type EntryState = 'waiting' | 'called' | 'done' | 'skipped' | 'cancelled'

/**
 * 現在の状態を含むエントリー
 * EntrySchemaに導出された状態情報を追加したマテリアライズドビュー
 * - state: イベントから計算された現在の状態
 * - lastEventAt: 最後のイベント発生日時
 * - lastEventType: 最後のイベントタイプ
 */
export interface EntryCurrentState extends EntrySchema {
  /** イベントから導出された現在の状態 */
  state: EntryState
  /** 最後のイベント発生日時 */
  lastEventAt: Date
  /** 最後のイベントタイプ */
  lastEventType: EntryEventType
}

/**
 * 待ち行列の統計情報
 * 全エントリーの状態を集計した結果
 */
export interface QueueStats {
  /** 待機中の件数 */
  totalWaiting: number
  /** 呼び出し済みの件数 */
  totalCalled: number
  /** 完了の件数 */
  totalDone: number
  /** キャンセルの件数 */
  totalCancelled: number
  /** スキップの件数 */
  totalSkipped: number
  /** 平均待ち時間（分） */
  averageWaitTime: number
}

/**
 * データベース書き込みレスポンス
 */
export interface WriteResponse {
  /** 成功フラグ */
  success: boolean
  /** エラーメッセージ（失敗時） */
  error?: string
}
