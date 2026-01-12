import { UuidSchema } from '~/infrastructure/database'
import { getNextTicketNumber as getNextTicketNumberFn } from '~/infrastructure/database/server-functions'
import type { GetNextTicketNumberResult } from '../types'

/**
 * 次の整理券番号を取得するユースケース
 * 待ち行列の最大番号+1を返す
 *
 * @param queueId 待ち行列ID
 * @returns 次の整理券番号、またはエラー
 */
export async function getNextTicketNumber(
  queueId: string
): Promise<GetNextTicketNumberResult | { error: string }> {
  try {
    // queueIdのバリデーション
    const validatedQueueId = UuidSchema.parse(queueId)
    const result = await getNextTicketNumberFn({ data: validatedQueueId })
    return { number: result.number }
  } catch (error) {
    console.error('Get next ticket number error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
