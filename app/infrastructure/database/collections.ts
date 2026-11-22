import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { trpc } from '~/client/trpc';
import { electricConfig } from './client';
import { DbEntryEventSchema, DbEntrySchema } from './schemas';

/**
 * エントリーコレクション
 * Electric SQLでPostgreSQLのentryテーブルと同期
 * - 不変のエントリーデータを保持
 * - リアルタイム同期
 * - Zodスキーマによる型検証
 * - tRPCによる書き込み
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
    onInsert: async ({ transaction, collection }) => {
      const { modified: newEntry } = transaction.mutations[0];
      // 整理券番号はサーバーで採番する（newEntry.number は画面表示用の仮の番号）
      const result = await trpc.entry.insert.mutate({
        id: newEntry.id,
        queue_id: newEntry.queue_id,
        party_size: newEntry.party_size,
        public_token: newEntry.public_token,
      });
      await collection.utils.awaitTxId(result.txid);
    },
  }),
);

/**
 * エントリーイベントコレクション
 * Electric SQLでPostgreSQLのentry_eventテーブルと同期
 * - イベントソーシングログを保持
 * - 追記専用（Append-only）
 * - リアルタイム同期
 * - Zodスキーマによる型検証
 * - tRPCによる書き込み
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
    onInsert: async ({ transaction, collection }) => {
      const { modified: newEvent } = transaction.mutations[0];
      const result = await trpc.entry.insertEvent.mutate({
        id: newEvent.id,
        entry_id: newEvent.entry_id,
        type: newEvent.type,
        actor: newEvent.actor,
        device_id: newEvent.device_id,
      });
      await collection.utils.awaitTxId(result.txid);
    },
  }),
);
