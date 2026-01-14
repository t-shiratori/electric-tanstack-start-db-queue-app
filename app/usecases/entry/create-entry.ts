import type { EntryRepository, EntryEventRepository } from '~/domain/repositories'
import { generateUuid } from '~/utils/uuid'
import { generateToken } from './generate-token'
import type { CreateEntryResult } from '../types'

/**
 * 新規エントリーを作成するユースケース
 * 受付端末での整理券発行処理
 *
 * プロセス:
 * 1. エントリーレコードを作成
 * 2. 作成完了を待機
 * 3. EntryCreatedイベントを記録
 * 4. イベント記録完了を待機
 *
 * @param entryRepository エントリーリポジトリ
 * @param eventRepository エントリーイベントリポジトリ
 * @param queueId 待ち行列ID
 * @param ticketNumber 整理券番号
 * @param partySize 人数（デフォルト: 1）
 * @returns 作成結果（エントリーID・トークンを含む）
 */
export async function createEntry(
  entryRepository: EntryRepository,
  eventRepository: EntryEventRepository,
  queueId: string,
  ticketNumber: number,
  partySize: number = 1
): Promise<CreateEntryResult> {
  const entryId = generateUuid()
  const token = generateToken()

  try {
    // 1. エントリーを挿入
    await entryRepository.insert({
      id: entryId,
      queue_id: queueId,
      number: ticketNumber,
      party_size: partySize,
      public_token: token,
      created_at: new Date(),
    })

    // 2. EntryCreatedイベントを記録
    await eventRepository.insert({
      id: generateUuid(),
      entry_id: entryId,
      type: 'created',
      actor: 'staff',
      device_id: null,
      created_at: new Date(),
    })

    return {
      success: true,
      entryId,
      token,
    }
  } catch (error) {
    console.error('Create entry error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
