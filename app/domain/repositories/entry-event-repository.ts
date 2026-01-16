import type { DbEventType } from '../entry/event-types';
import type { EventActor } from '../entry/types';

/**
 * エントリーイベント作成データ
 * リポジトリに渡すイベント情報
 */
export interface CreateEntryEventData {
  id: string;
  entry_id: string;
  type: DbEventType;
  actor: EventActor;
  device_id: string | null;
  created_at: Date;
}

/**
 * エントリーイベントリポジトリインターフェース
 * ユースケース層がインフラ層に依存しないための抽象化
 */
export interface EntryEventRepository {
  /**
   * エントリーイベントを挿入する
   * @param event イベントデータ
   * @returns トランザクション完了を待つPromise
   */
  insert(event: CreateEntryEventData): Promise<void>;
}
