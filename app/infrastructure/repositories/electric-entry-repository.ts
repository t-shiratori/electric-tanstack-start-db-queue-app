import type { CreateEntryData, EntryRepository, PersistedEntry } from '~/domain/repositories';
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
     * 仮の番号で画面に即時反映し、サーバーで確定した番号を返す
     * @param entry エントリーデータ
     * @returns 永続化が完了したエントリーの情報（確定した整理券番号）
     */
    async insert(entry: CreateEntryData): Promise<PersistedEntry> {
      const tx = entriesCollection.insert({
        id: entry.id,
        queue_id: entry.queue_id,
        number: entry.number,
        party_size: entry.party_size,
        public_token: entry.public_token,
        created_at: entry.created_at,
      });

      // ElectricSQLのトランザクションが完了するまで待機
      // （onInsert で awaitTxId しているため、完了時には同期済みの行がコレクションに入っている）
      await tx.when('settled');

      const persisted = entriesCollection.get(entry.id);
      if (!persisted) {
        throw new Error('登録したエントリーが同期されていません');
      }
      return { number: persisted.number };
    },
  };
}
