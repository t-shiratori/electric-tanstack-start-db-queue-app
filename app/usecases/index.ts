/**
 * ユースケース層
 * ビジネスユースケースの実装
 * ドメイン層とインフラストラクチャ層を組み合わせてアプリケーション機能を提供
 */

// 型定義
export type {
  UseCaseResult,
  CreateEntryResult,
  GetNextTicketNumberResult,
} from './types'

// エントリー関連ユースケース
export {
  createEntry,
  addEntryEvent,
  callEntry,
  markEntryDone,
  skipEntry,
  cancelEntry,
  generateToken,
} from './entry'

// 待ち行列関連ユースケース
export { getNextTicketNumber } from './queue'
