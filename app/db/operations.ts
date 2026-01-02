import type { EntryEventType, WriteResponse } from './types'

/**
 * APIエンドポイント経由でPostgreSQLデータベースに書き込む
 */
async function writeToDatabase(
  sql: string,
  params?: unknown[]
): Promise<WriteResponse> {
  try {
    const response = await fetch('/api/db/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    })

    if (!response.ok) {
      throw new Error(`Database write failed: ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Database write error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

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
  const entryId = crypto.randomUUID()
  const token = generateToken()

  // エントリーを挿入
  const entrySql = `
    INSERT INTO entry (id, queue_id, number, party_size, public_token, created_at)
    VALUES ($1, $2, $3, $4, $5, now())
  `
  const entryParams = [entryId, queueId, ticketNumber, partySize, token]

  const entryResult = await writeToDatabase(entrySql, entryParams)
  if (!entryResult.success) {
    return entryResult
  }

  // EntryCreatedイベントを挿入
  const eventSql = `
    INSERT INTO entry_event (id, entry_id, type, created_at, actor)
    VALUES ($1, $2, $3, now(), $4)
  `
  const eventParams = [crypto.randomUUID(), entryId, 'created', 'staff']

  const eventResult = await writeToDatabase(eventSql, eventParams)
  if (!eventResult.success) {
    return eventResult
  }

  return {
    success: true,
    entryId,
    token,
  }
}

/**
 * エントリーにイベントを追加（汎用イベント操作）
 */
export async function addEntryEvent(
  entryId: string,
  eventType: Exclude<EntryEventType, 'EntryCreated'>,
  actor: 'staff' | 'system' | 'user' = 'staff',
  deviceId?: string
): Promise<WriteResponse> {
  const eventId = crypto.randomUUID()

  // イベントタイプをデータベースのenum値にマッピング
  const dbEventType = eventType.replace('Entry', '').toLowerCase()

  const sql = `
    INSERT INTO entry_event (id, entry_id, type, created_at, actor, device_id)
    VALUES ($1, $2, $3, now(), $4, $5)
  `
  const params = [eventId, entryId, dbEventType, actor, deviceId || null]

  return writeToDatabase(sql, params)
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
  actor: 'staff' | 'user' = 'user'
): Promise<WriteResponse> {
  return addEntryEvent(entryId, 'EntryCancelled', actor)
}

/**
 * 待ち行列の次の番号を取得
 */
export async function getNextTicketNumber(
  queueId: string
): Promise<{ number: number } | { error: string }> {
  try {
    const response = await fetch(`/api/queue/${queueId}/next-number`)

    if (!response.ok) {
      throw new Error(`Failed to get next number: ${response.statusText}`)
    }

    const data = await response.json()
    return { number: data.number }
  } catch (error) {
    console.error('Get next number error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
