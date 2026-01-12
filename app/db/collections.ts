import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { EntryValidationSchema, EntryEventValidationSchema } from './validation-schemas'
import { insertEntry, insertEntryEvent } from './server-functions'
import { clientEnv } from '~/infrastructure/env/env.client'

/**
 * エントリーコレクション
 * Electric SQLでPostgreSQLのentryテーブルと同期
 * - 不変のエントリーデータを保持
 * - リアルタイム同期
 * - Zodスキーマによる型検証
 * - サーバー関数による書き込み
 */
export const entriesCollection = createCollection(
  electricCollectionOptions<typeof EntryValidationSchema>({
    id: 'entries',
    schema: EntryValidationSchema,
    getKey: (entry) => entry.id,
    shapeOptions: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: 'entry',
      },
      parser: {
        timestamptz: (value: string) => new Date(value),
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
  electricCollectionOptions<typeof EntryEventValidationSchema>({
    id: 'entryEvents',
    schema: EntryEventValidationSchema,
    getKey: (event) => event.id,
    shapeOptions: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: 'entry_event',
      },
      parser: {
        timestamptz: (value: string) => new Date(value),
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
