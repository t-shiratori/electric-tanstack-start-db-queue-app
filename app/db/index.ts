// 型定義
export type {
  EntryEventType,
  EntrySchema,
  EntryEventSchema,
  EntryState,
  EntryCurrentState,
  QueueStats,
  WriteResponse,
} from './types'

// コレクション
export { entriesCollection, entryEventsCollection } from './collections'

// データベースクライアント
export {
  entriesDB,
  entryEventsDB,
  initElectricSync,
} from './client'

// 操作
export {
  createEntry,
  addEntryEvent,
  callEntry,
  markEntryDone,
  skipEntry,
  cancelEntry,
  getNextTicketNumber,
} from './operations'

// Reactフック（マテリアライズドビュー）
export {
  useEntryStates,
  useEntriesByState,
  useQueueStats,
  useEntryByToken,
  useNextWaitingEntry,
  useWaitingEntries,
  useCalledEntries,
} from './hooks'
