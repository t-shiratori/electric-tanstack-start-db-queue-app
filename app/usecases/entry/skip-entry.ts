import { addEntryEvent } from './add-entry-event'
import type { UseCaseResult } from '../types'

/**
 * エントリーをスキップするユースケース
 * 呼び出し端末での操作
 *
 * @param entryId エントリーID
 * @param deviceId デバイスID（オプション）
 * @returns 操作結果
 */
export async function skipEntry(
  entryId: string,
  deviceId?: string
): Promise<UseCaseResult> {
  return addEntryEvent(entryId, 'EntrySkipped', 'staff', deviceId)
}
