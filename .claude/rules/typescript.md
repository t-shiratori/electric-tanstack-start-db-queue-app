---
paths: app/**/*.{ts,tsx}
---


# TypeScriptファイル用ルール

- anyは禁止
- asで型エラーを握りつぶすのも原則禁止
  - タイプガードを作るか変換専用の関数などを作って型安全に処理すること 

## コメントの書き方

```ts

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

/**
 * 現在の状態を含むエントリー
 * EntrySchemaに導出された状態情報を追加したマテリアライズドビュー
 * @property state: イベントから計算された現在の状態
 * @property lastEventAt: 最後のイベント発生日時
 * @property lastEventType: 最後のイベントタイプ
 * @extends EntrySchema {@link EntrySchema}
 */
export interface EntryCurrentState extends EntrySchema {
  state: EntryState
  lastEventAt: Date
  lastEventType: EntryEventType
}

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
```
