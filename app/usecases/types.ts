/**
 * ユースケース層の共通型定義
 */

/**
 * ユースケース実行結果の基本型
 * 成功/失敗を表現する
 */
export interface UseCaseResult {
  success: boolean;
  error?: string;
}

/**
 * エントリー作成ユースケースの結果
 * 作成されたエントリーIDとトークンを含む
 */
export interface CreateEntryResult extends UseCaseResult {
  entryId?: string;
  token?: string;
}

/**
 * 次の整理券番号取得結果
 */
export interface GetNextTicketNumberResult {
  number: number;
}
