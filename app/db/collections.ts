import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'

// ElectricSQL設定
const ELECTRIC_URL =
  import.meta.env.VITE_ELECTRIC_URL || 'http://localhost:3000'

/**
 * エントリーコレクション
 * Electric SQLでPostgreSQLのentryテーブルと同期
 * - 不変のエントリーデータを保持
 * - リアルタイム同期
 */
export const entriesCollection = createCollection(
  electricCollectionOptions({
    id: 'entries',
    getKey: (entry: Record<string, unknown>) => entry.id as string,
    shapeOptions: {
      url: `${ELECTRIC_URL}/v1/shape/entry`,
      parser: {
        timestamptz: (value: string) => new Date(value),
      },
    },
  })
)

/**
 * エントリーイベントコレクション
 * Electric SQLでPostgreSQLのentry_eventテーブルと同期
 * - イベントソーシングログを保持
 * - 追記専用（Append-only）
 * - リアルタイム同期
 */
export const entryEventsCollection = createCollection(
  electricCollectionOptions({
    id: 'entryEvents',
    getKey: (event: Record<string, unknown>) => event.id as string,
    shapeOptions: {
      url: `${ELECTRIC_URL}/v1/shape/entry_event`,
      parser: {
        timestamptz: (value: string) => new Date(value),
      },
    },
  })
)
