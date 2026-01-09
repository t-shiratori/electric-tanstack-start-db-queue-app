import { entriesCollection, entryEventsCollection } from './collections'

// コレクションを直接エクスポート
export const entriesDB = entriesCollection
export const entryEventsDB = entryEventsCollection

/**
 * すべてのElectric同期を初期化
 * electricCollectionOptionsを使用したコレクションはクエリ時に自動的に同期される
 * この関数は一貫性のために提供されているが、同期はコレクション設定で処理されるため何もする必要はない
 */
export function initElectricSync() {
  // Electricコレクションはクエリ実行時に自動的に同期される
  // no-opクリーンアップ関数を返す
  return () => {
    // クリーンアップ不要
  }
}
