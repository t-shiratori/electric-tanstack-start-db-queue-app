import { addEntryEvent } from './add-entry-event'
import type { UseCaseResult } from '../types'

/**
 * エントリーを完了としてマークするユースケース
 * 呼び出し端末での操作
 *
 * @param entryId エントリーID
 * @param deviceId デバイスID（オプション）
 * @returns 操作結果
 */
export async function markEntryDone(
  entryId: string,
  deviceId?: string
): Promise<UseCaseResult> {
  return addEntryEvent(entryId, 'EntryDone', 'staff', deviceId)
}
