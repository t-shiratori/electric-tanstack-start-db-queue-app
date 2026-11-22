/**
 * エントリー作成データ
 * リポジトリに渡すエントリー情報
 * @property number 仮の整理券番号（画面への即時反映用。確定番号はサーバーが採番する）
 */
export interface CreateEntryData {
  id: string;
  queue_id: string;
  number: number;
  party_size: number;
  public_token: string;
  created_at: Date;
}

/**
 * 永続化されたエントリーの情報
 * @property number サーバーで確定した整理券番号
 */
export interface PersistedEntry {
  number: number;
}

/**
 * エントリーリポジトリインターフェース
 * ユースケース層がインフラ層に依存しないための抽象化
 */
export interface EntryRepository {
  /**
   * エントリーを挿入する
   * @param entry エントリーデータ
   * @returns 永続化が完了したエントリーの情報（確定した整理券番号）
   */
  insert(entry: CreateEntryData): Promise<PersistedEntry>;
}
