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
 * エントリーエンティティ
 * 不変属性のみを含む（作成後変更されない）
 * 状態は含まない（イベントから導出）
 * @property id エントリーID（UUID）
 * @property ticketNumber 整理券番号
 * @property createdAt 作成日時
 * @property token スマホアクセス用のユニークトークン
 */
export interface Entry {
  id: string
  ticketNumber: number
  createdAt: Date
  token: string
}

/**
 * エントリーイベントエンティティ
 * イベントソーシングパターンで使用するイベントログ
 * 追記専用（Append-only）
 * 状態変更の履歴を保持
 * @property id イベントID（UUID）
 * @property entryId 関連するエントリーのID
 * @property type イベントタイプ
 * @property createdAt イベント発生日時
 * @property actor イベント実行者（staff: スタッフ, system: システム, user: ユーザー）
 */
export interface EntryEvent {
  id: string
  entryId: string
  type: EntryEventType
  createdAt: Date
  actor: EventActor
}

/**
 * 現在の状態を含むエントリー（読み取りモデル）
 * Entryに導出された状態情報を追加したマテリアライズドビュー
 * @property state イベントから計算された現在の状態
 * @property lastEventAt 最後のイベント発生日時
 * @property lastEventType 最後のイベントタイプ
 * @extends Entry {@link Entry}
 */
export interface EntryWithState extends Entry {
  state: EntryState
  lastEventAt: Date
  lastEventType: EntryEventType
}
