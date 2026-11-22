import type { DbEventType } from '../entry/event-types';
import type { EntryEvent, EventActor } from '../entry/types';

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
   * エントリーに紐づくイベントを取得する
   * ローカルに同期済みのイベントと、未確定（楽観的）のイベントを含む
   * @param entryId エントリーID
   * @returns ドメインのイベント配列
   */
  findByEntryId(entryId: string): EntryEvent[];

  /**
   * エントリーイベントを挿入する
   * @param event イベントデータ
   * @returns トランザクション完了を待つPromise
   */
  insert(event: CreateEntryEventData): Promise<void>;
}
