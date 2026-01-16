import type { EventActor } from '~/domain/entry';
import type { EntryEventRepository } from '~/domain/repositories';
import type { UseCaseResult } from '../types';
import { addEntryEvent } from './add-entry-event';

/**
 * エントリーをキャンセルするユースケース
 * ユーザーまたはスタッフによる操作
 *
 * @param repository エントリーイベントリポジトリ
 * @param entryId エントリーID
 * @param actor イベント実行者（デフォルト: user）
 * @returns 操作結果
 */
export async function cancelEntry(
  repository: EntryEventRepository,
  entryId: string,
  actor: Extract<EventActor, 'staff' | 'user'> = 'user',
): Promise<UseCaseResult> {
  return addEntryEvent(repository, entryId, 'EntryCancelled', actor);
}
