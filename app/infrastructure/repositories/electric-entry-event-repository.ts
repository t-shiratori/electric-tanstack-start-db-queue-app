import type { EntryEventRepository, CreateEntryEventData } from '~/domain/repositories'
import { entryEventsCollection } from '../database/collections'

/**
 * ElectricSQL実装のエントリーイベントリポジトリ
 * TanStack DBのElectricSQLコレクションを使用
 */
export class ElectricEntryEventRepository implements EntryEventRepository {
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
    })

    // ElectricSQLのトランザクションが完了するまで待機
    await tx.isPersisted.promise
  }
}
