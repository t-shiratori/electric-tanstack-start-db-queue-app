import { createServerFn } from '@tanstack/react-start'
import pg from 'pg'
import {
  InsertEntryValidationSchema,
  InsertEntryEventValidationSchema,
  UuidValidationSchema,
} from './validation-schemas'
import { DATABASE_URL } from '~/infra'

const { Pool } = pg

const pool = new Pool({
  connectionString: DATABASE_URL,
})

export const insertEntry = createServerFn({ method: 'POST' })
  .inputValidator(InsertEntryValidationSchema)
  .handler(async ({ data }) => {
    const { id, queue_id, number, party_size, public_token } = data

    console.log('='.repeat(60))
    console.log('📝 整理券発行')
    console.log('='.repeat(60))
    console.log(`整理券番号: ${number}`)
    console.log(`人数: ${party_size}名`)
    console.log(`トークン: ${public_token}`)
    console.log(`エントリーID: ${id}`)
    console.log(`キューID: ${queue_id}`)
    console.log(`発行時刻: ${new Date().toLocaleString('ja-JP')}`)

    try {
      // PostgreSQLにINSERTし、トランザクションIDを取得
      const result = await pool.query(
        'INSERT INTO entry (id, queue_id, number, party_size, public_token, created_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING (SELECT pg_current_xact_id()::text as txid)',
        [id, queue_id, number, party_size, public_token]
      )

      // ElectricSQL用のtxidを返す
      const txid = parseInt(result.rows[0]?.txid || '0', 10)
      console.log(`✅ エントリー書き込み成功 (txid: ${txid})`)
      console.log('='.repeat(60))
      return { txid, success: true }
    } catch (error) {
      console.error('❌ Insert entry error:', error)
      console.log('='.repeat(60))
      throw error
    }
  })

export const insertEntryEvent = createServerFn({ method: 'POST' })
  .inputValidator(InsertEntryEventValidationSchema)
  .handler(async ({ data }) => {
    const { id, entry_id, type, actor, device_id } = data

    const eventTypeMap: Record<string, string> = {
      created: '受付',
      called: '呼び出し',
      done: '完了',
      skipped: 'スキップ',
      cancelled: 'キャンセル',
    }

    console.log(`📌 イベント記録: ${eventTypeMap[type] || type} (${actor}${device_id ? `, デバイス: ${device_id}` : ''})`)

    try {
      const result = await pool.query(
        'INSERT INTO entry_event (id, entry_id, type, created_at, actor, device_id) VALUES ($1, $2, $3, now(), $4, $5) RETURNING (SELECT pg_current_xact_id()::text as txid)',
        [id, entry_id, type, actor, device_id || null]
      )

      const txid = parseInt(result.rows[0]?.txid || '0', 10)
      console.log(`   ✅ イベント記録成功 (txid: ${txid})`)
      return { txid, success: true }
    } catch (error) {
      console.error('❌ Insert entry event error:', error)
      throw error
    }
  })

export const getNextTicketNumber = createServerFn({ method: 'GET' })
  .inputValidator(UuidValidationSchema)
  .handler(async ({ data: queueId }) => {
    try {
      const result = await pool.query(
        'SELECT COALESCE(MAX(number), 0) as max_number FROM entry WHERE queue_id = $1',
        [queueId]
      )
      const maxNumber = result.rows[0]?.max_number || 0
      return { number: maxNumber + 1 }
    } catch (error) {
      console.error('Get next number error:', error)
      throw error
    }
  })
