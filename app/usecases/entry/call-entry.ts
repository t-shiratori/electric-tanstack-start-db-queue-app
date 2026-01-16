import type { EntryEventRepository } from '~/domain/repositories';
import type { UseCaseResult } from '../types';
import { addEntryEvent } from './add-entry-event';

/**
 * エントリーを呼び出すユースケース
 * 呼び出し端末での操作
 *
 * @param repository エントリーイベントリポジトリ
 * @param entryId エントリーID
 * @param deviceId デバイスID（オプション）
 * @returns 操作結果
 */
export async function callEntry(
  repository: EntryEventRepository,
  entryId: string,
  deviceId?: string,
): Promise<UseCaseResult> {
  return addEntryEvent(repository, entryId, 'EntryCalled', 'staff', deviceId);
}
