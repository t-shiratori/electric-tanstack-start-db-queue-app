import { entriesCollection, entryEventsCollection } from '~/infrastructure/database'
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
 * @param queueId 待ち行列ID
 * @param ticketNumber 整理券番号
 * @param partySize 人数（デフォルト: 1）
 * @returns 作成結果（エントリーID・トークンを含む）
 */
export async function createEntry(
  queueId: string,
  ticketNumber: number,
  partySize: number = 1
): Promise<CreateEntryResult> {
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
