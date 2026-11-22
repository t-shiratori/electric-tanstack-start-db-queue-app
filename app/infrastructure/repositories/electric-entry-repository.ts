import type { CreateEntryData, EntryRepository } from '~/domain/repositories';
import { entriesCollection } from '../database/collections';

/**
 * ElectricSQL実装のエントリーリポジトリを作成
 * TanStack DBのElectricSQLコレクションを使用
 *
 * @returns エントリーリポジトリ
 */
export function createElectricEntryRepository(): EntryRepository {
  return {
    /**
     * エントリーを挿入する
     * @param entry エントリーデータ
     * @returns トランザクション完了を待つPromise
     */
    async insert(entry: CreateEntryData): Promise<void> {
      const tx = entriesCollection.insert({
        id: entry.id,
        queue_id: entry.queue_id,
        number: entry.number,
        party_size: entry.party_size,
        public_token: entry.public_token,
        created_at: entry.created_at,
      });

      // ElectricSQLのトランザクションが完了するまで待機
      await tx.when('settled');
    },
  };
}
