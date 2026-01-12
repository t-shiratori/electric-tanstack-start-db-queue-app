import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { DbEntrySchema, DbEntryEventSchema } from './schemas'
import { insertEntry, insertEntryEvent } from '../server/functions'
import { electricConfig } from './client'

/**
 * エントリーコレクション
 * Electric SQLでPostgreSQLのentryテーブルと同期
 * - 不変のエントリーデータを保持
 * - リアルタイム同期
 * - Zodスキーマによる型検証
 * - サーバー関数による書き込み
 */
export const entriesCollection = createCollection(
  electricCollectionOptions<typeof DbEntrySchema>({
    id: 'entries',
    schema: DbEntrySchema,
    getKey: (entry) => entry.id,
    shapeOptions: {
      ...electricConfig,
      params: {
        table: 'entry',
      },
    },
    onInsert: async ({ transaction }) => {
      const { modified: newEntry } = transaction.mutations[0]
      const result = await insertEntry({
        data: {
          id: newEntry.id,
          queue_id: newEntry.queue_id,
          number: newEntry.number,
          party_size: newEntry.party_size,
          public_token: newEntry.public_token,
        },
      })
      return { txid: result.txid }
    },
  })
)

/**
 * エントリーイベントコレクション
 * Electric SQLでPostgreSQLのentry_eventテーブルと同期
 * - イベントソーシングログを保持
 * - 追記専用（Append-only）
 * - リアルタイム同期
 * - Zodスキーマによる型検証
 * - サーバー関数による書き込み
 */
export const entryEventsCollection = createCollection(
  electricCollectionOptions<typeof DbEntryEventSchema>({
    id: 'entryEvents',
    schema: DbEntryEventSchema,
    getKey: (event) => event.id,
    shapeOptions: {
      ...electricConfig,
      params: {
        table: 'entry_event',
      },
    },
    onInsert: async ({ transaction }) => {
      const { modified: newEvent } = transaction.mutations[0]
      const result = await insertEntryEvent({
        data: {
          id: newEvent.id,
          entry_id: newEvent.entry_id,
          type: newEvent.type,
          actor: newEvent.actor,
          device_id: newEvent.device_id,
        },
      })
      return { txid: result.txid }
    },
  })
)
