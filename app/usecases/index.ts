/**
 * ユースケース層
 * ビジネスユースケースの実装
 * ドメイン層とインフラストラクチャ層を組み合わせてアプリケーション機能を提供
 */

// エントリー関連ユースケース
export {
  addEntryEvent,
  callEntry,
  cancelEntry,
  createEntry,
  generateToken,
  markEntryDone,
  skipEntry,
} from './entry';
// 待ち行列関連ユースケース
export { getNextTicketNumber } from './queue';
// 型定義
export type {
  CreateEntryResult,
  GetNextTicketNumberResult,
  UseCaseResult,
} from './types';
