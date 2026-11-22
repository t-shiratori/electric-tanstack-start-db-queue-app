import type { EntryEvent } from '~/domain/entry';
import type { CreateEntryEventData, EntryEventRepository } from '~/domain/repositories';
import { entryEventsCollection } from '../database/collections';
import { toDomainEntryEvent } from '../database/mappers/entry-event-mapper';

/**
 * ElectricSQL実装のエントリーイベントリポジトリを作成
 * TanStack DBのElectricSQLコレクションを使用
 *
 * @returns エントリーイベントリポジトリ
 */
export function createElectricEntryEventRepository(): EntryEventRepository {
  return {
    /**
     * エントリーに紐づくイベントを取得する
     * コレクションの現在の内容（同期済み＋未確定の変更）から絞り込む
     * @param entryId エントリーID
     * @returns ドメインのイベント配列
     */
    findByEntryId(entryId: string): EntryEvent[] {
      return entryEventsCollection.toArray.filter((event) => event.entry_id === entryId).map(toDomainEntryEvent);
    },

    /**
     * エントリーイベントを挿入する
     * @param event イベントデータ
     * @returns トランザクション完了を待つPromise
     */
    async insert(event: CreateEntryEventData): Promise<void> {
      const tx = entryEventsCollection.insert({
        id: event.id,
        entry_id: event.entry_id,
        type: event.type,
        actor: event.actor,
        device_id: event.device_id,
        created_at: event.created_at,
      });

      // ElectricSQLのトランザクションが完了するまで待機
      await tx.when('settled');
    },
  };
}
