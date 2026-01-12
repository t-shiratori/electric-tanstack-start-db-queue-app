import type { EntryEventType, EventActor } from '~/domain/entry'
import { toDbEventType } from '~/domain/entry'
import { entryEventsCollection } from '~/infrastructure/database'
import { generateUuid } from '~/utils/uuid'
import type { UseCaseResult } from '../types'

/**
 * エントリーにイベントを追加するユースケース
 * イベントソーシングパターンでの状態変更の基本操作
 *
 * @param entryId エントリーID
 * @param eventType イベントタイプ（EntryCreated以外）
 * @param actor イベント実行者（デフォルト: staff）
 * @param deviceId デバイスID（オプション）
 * @returns 操作結果
 */
export async function addEntryEvent(
  entryId: string,
  eventType: Exclude<EntryEventType, 'EntryCreated'>,
  actor: EventActor = 'staff',
  deviceId?: string
): Promise<UseCaseResult> {
  try {
    // TanStack DBのcollection.insert()を使用してイベントを挿入
    // onInsertハンドラーが自動的にサーバー関数を呼び出す
    entryEventsCollection.insert({
      id: generateUuid(),
      entry_id: entryId,
      type: toDbEventType(eventType),
      actor,
      device_id: deviceId || null,
      created_at: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error('Add entry event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
