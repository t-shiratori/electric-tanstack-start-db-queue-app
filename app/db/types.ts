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
 * EntryEventTypeをDbEventTypeに変換する型安全な変換関数
 * @param eventType 変換元のエントリーイベントタイプ
 * @returns 変換後のデータベースイベントタイプ
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
 * 状態は含まない（イベントから導出）
 * Electric SQLで同期される正のデータ
 * @property id エントリーID（UUID）
 * @property ticketNumber 整理券番号
 * @property createdAt 作成日時
 * @property token スマホアクセス用のユニークトークン
 */
export interface EntrySchema {
  id: string
  ticketNumber: number
  createdAt: Date
  token: string
}

/**
 * エントリーイベントコレクションスキーマ
 * イベントソーシングパターンで使用するイベントログ
 * 追記専用（Append-only）
 * 状態変更の履歴を保持
 * Electric SQLで同期される
 * @property id イベントID（UUID）
 * @property entryId 関連するエントリーのID
 * @property type イベントタイプ
 * @property createdAt イベント発生日時
 * @property actor イベント実行者（staff: スタッフ, system: システム, user: ユーザー）
 */
export interface EntryEventSchema {
  id: string
  entryId: string
  type: EntryEventType
  createdAt: Date
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
 * @property state イベントから計算された現在の状態
 * @property lastEventAt 最後のイベント発生日時
 * @property lastEventType 最後のイベントタイプ
 * @extends EntrySchema {@link EntrySchema}
 */
export interface EntryCurrentState extends EntrySchema {
  state: EntryState
  lastEventAt: Date
  lastEventType: EntryEventType
}

/**
 * 待ち行列の統計情報
 * 全エントリーの状態を集計した結果
 * @property totalWaiting 待機中の件数
 * @property totalCalled 呼び出し済みの件数
 * @property totalDone 完了の件数
 * @property totalCancelled キャンセルの件数
 * @property totalSkipped スキップの件数
 * @property averageWaitTime 平均待ち時間（分）
 */
export interface QueueStats {
  totalWaiting: number
  totalCalled: number
  totalDone: number
  totalCancelled: number
  totalSkipped: number
  averageWaitTime: number
}

/**
 * データベース書き込みレスポンス
 * @property success 成功フラグ
 * @property error エラーメッセージ（失敗時）
 */
export interface WriteResponse {
  success: boolean
  error?: string
}
