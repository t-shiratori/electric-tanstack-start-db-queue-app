/**
 * エントリー作成データ
 * リポジトリに渡すエントリー情報
 */
export interface CreateEntryData {
  id: string
  queue_id: string
  number: number
  party_size: number
  public_token: string
  created_at: Date
}

/**
 * エントリーリポジトリインターフェース
 * ユースケース層がインフラ層に依存しないための抽象化
 */
export interface EntryRepository {
  /**
   * エントリーを挿入する
   * @param entry エントリーデータ
   * @returns トランザクション完了を待つPromise
   */
  insert(entry: CreateEntryData): Promise<void>
}
