import type {
  EntryEventType,
  WriteResponse,
  EventActor,
} from './types'
import { toDbEventType } from './types'
import { UuidValidationSchema, type Uuid } from './validation-schemas'
import { entriesCollection, entryEventsCollection } from './collections'
import { getNextTicketNumber as getNextTicketNumberFn } from './server-functions'
import { generateUuid } from '~/utils/uuid'

/**
 * スマホアクセス用のユニークなトークンを生成
 */
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let token = ''
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * 新規エントリーを作成（受付端末操作）
 * エントリーIDと公開トークンを返す
 */
export async function createEntry(
  queueId: string,
  ticketNumber: number,
  partySize: number = 1
): Promise<WriteResponse & { entryId?: string; token?: string }> {
  const entryId = generateUuid()
  const token = generateToken()

  try {
    // 1. エントリーを挿入し、Transactionオブジェクトを取得
    const entryTx = entriesCollection.insert({
      id: entryId,
      queue_id: queueId,
      number: ticketNumber,
      party_size: partySize,
      public_token: token,
      created_at: new Date(),
    })

    // 2. entryの挿入が完了するまで待機（サーバーへの書き込み + ElectricSQL同期完了）
    // isPersisted.promiseは、onInsertハンドラーが完了し、
    // ElectricSQLでtxidが同期されるまで待機する
    await entryTx.isPersisted.promise

    // 3. ElectricSQLのshapeストリームから実際のデータが届くまで待機
    // txidが同期されても、データの到着まで若干のラグがあるため
    await new Promise(resolve => setTimeout(resolve, 100))

    // 4. entryの挿入完了後、entry_eventを挿入
    // この時点でentryはすでにデータベースに存在するため、外部キー制約を満たせる
    const eventTx = entryEventsCollection.insert({
      id: generateUuid(),
      entry_id: entryId,
      type: 'created',
      actor: 'staff',
      device_id: null,
      created_at: new Date(),
    })

    // 5. eventの挿入が完了するまで待機
    await eventTx.isPersisted.promise

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

/**
 * エントリーにイベントを追加（汎用イベント操作）
 */
export async function addEntryEvent(
  entryId: string,
  eventType: Exclude<EntryEventType, 'EntryCreated'>,
  actor: EventActor = 'staff',
  deviceId?: string
): Promise<WriteResponse> {
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

/**
 * エントリーを呼び出す（呼び出し端末操作）
 */
export async function callEntry(
  entryId: string,
  deviceId?: string
): Promise<WriteResponse> {
  return addEntryEvent(entryId, 'EntryCalled', 'staff', deviceId)
}

/**
 * エントリーを完了としてマーク（呼び出し端末操作）
 */
export async function markEntryDone(
  entryId: string,
  deviceId?: string
): Promise<WriteResponse> {
  return addEntryEvent(entryId, 'EntryDone', 'staff', deviceId)
}

/**
 * エントリーをスキップ（呼び出し端末操作）
 */
export async function skipEntry(
  entryId: string,
  deviceId?: string
): Promise<WriteResponse> {
  return addEntryEvent(entryId, 'EntrySkipped', 'staff', deviceId)
}

/**
 * エントリーをキャンセル（ユーザー/スタッフ操作）
 */
export async function cancelEntry(
  entryId: string,
  actor: Extract<EventActor, 'staff' | 'user'> = 'user'
): Promise<WriteResponse> {
  return addEntryEvent(entryId, 'EntryCancelled', actor)
}

/**
 * 待ち行列の次の番号を取得
 */
export async function getNextTicketNumber(
  queueId: Uuid
): Promise<{ number: number } | { error: string }> {
  try {
    // queueIdのバリデーション
    const validatedQueueId = UuidValidationSchema.parse(queueId)
    const result = await getNextTicketNumberFn({ data: validatedQueueId })
    return { number: result.number }
  } catch (error) {
    console.error('Get next number error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
