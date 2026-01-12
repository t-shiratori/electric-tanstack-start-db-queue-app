import type { EventActor } from '~/domain/entry'
import { addEntryEvent } from './add-entry-event'
import type { UseCaseResult } from '../types'

/**
 * エントリーをキャンセルするユースケース
 * ユーザーまたはスタッフによる操作
 *
 * @param entryId エントリーID
 * @param actor イベント実行者（デフォルト: user）
 * @returns 操作結果
 */
export async function cancelEntry(
  entryId: string,
  actor: Extract<EventActor, 'staff' | 'user'> = 'user'
): Promise<UseCaseResult> {
  return addEntryEvent(entryId, 'EntryCancelled', actor)
}
