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
 * 作成されたエントリーID・トークン・確定した整理券番号を含む
 * @property entryId エントリーID
 * @property token スマホアクセス用トークン
 * @property ticketNumber サーバーで確定した整理券番号
 * @extends UseCaseResult {@link UseCaseResult}
 */
export interface CreateEntryResult extends UseCaseResult {
  entryId?: string;
  token?: string;
  ticketNumber?: number;
}

/**
 * 次の整理券番号取得結果
 */
export interface GetNextTicketNumberResult {
  number: number;
}
