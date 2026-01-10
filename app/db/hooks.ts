import { eq, useLiveQuery } from '@tanstack/react-db'
import { useMemo } from 'react'
import { z } from 'zod'
import { entriesDB, entryEventsDB } from './client'
import {
  DB_EVENT_TYPE_TO_ENTRY_EVENT_TYPE,
  DB_EVENT_TYPES,
  ENTRY_EVENT_TYPE,
  ENTRY_EVENT_TYPE_TO_STATE,
  ENTRY_STATE,
  EVENT_ACTORS,
} from './const'
import { UuidValidationSchema } from './validation-schemas'
import type {
  DbEventType,
  EntryCurrentState,
  EntryEventSchema,
  EntrySchema,
  EntryState,
  EntryEventType,
  QueueStats,
} from './types'

/**
 * JOINクエリの結果のバリデーションスキーマ
 */
const JoinedEntryEventRowSchema = z.object({
  id: UuidValidationSchema,
  ticketNumber: z.number().int().positive(),
  createdAt: z.date(),
  token: z.string().length(8),
  eventId: UuidValidationSchema.nullable().optional(),
  eventType: z.enum(DB_EVENT_TYPES).nullable().optional(),
  eventCreatedAt: z.date().nullable().optional(),
  eventActor: z.enum(EVENT_ACTORS).nullable().optional(),
})

type JoinedEntryEventRow = z.infer<typeof JoinedEntryEventRowSchema>

/**
 * DbEventTypeをEntryEventTypeに変換
 */
function toEntryEventType(dbEventType: DbEventType): EntryEventType {
  return DB_EVENT_TYPE_TO_ENTRY_EVENT_TYPE[dbEventType]
}

/**
 * イベントソーシングパターンを使用してイベントから現在の状態を導出
 * 最新のイベントが優先順位に従って優先される
 */
function deriveEntryState(events: EntryEventSchema[]): EntryState {
  if (events.length === 0) return ENTRY_STATE.WAITING

  // イベントを作成時刻でソート（新しい順）
  const sortedEvents = [...events].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  // 最新のイベントから状態を導出
  const latestEvent = sortedEvents[0]
  return ENTRY_EVENT_TYPE_TO_STATE[latestEvent.type]
}

/**
 * join結果からEntryCurrentStateの配列を構築するヘルパー関数
 * バリデーション済みのデータを受け取る
 */
function buildEntryStatesFromJoinedData(
  joinedData: JoinedEntryEventRow[]
): EntryCurrentState[] {
  // エントリーIDでグループ化
  const entriesMap = new Map<
    string,
    {
      entry: EntrySchema
      events: EntryEventSchema[]
    }
  >()

  for (const row of joinedData) {
    if (!entriesMap.has(row.id)) {
      entriesMap.set(row.id, {
        entry: {
          id: row.id,
          ticketNumber: row.ticketNumber,
          createdAt: row.createdAt,
          token: row.token,
        },
        events: [],
      })
    }

    // イベントが存在する場合のみ追加
    if (row.eventId && row.eventType && row.eventActor && row.eventCreatedAt) {
      entriesMap.get(row.id)!.events.push({
        id: row.eventId,
        entryId: row.id,
        type: toEntryEventType(row.eventType),
        createdAt: row.eventCreatedAt,
        actor: row.eventActor,
      })
    }
  }

  // 各エントリーの現在の状態を計算
  return Array.from(entriesMap.values()).map(({ entry, events }) => {
    const state = deriveEntryState(events)

    const sortedEvents = [...events].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
    const lastEvent = sortedEvents[0]

    return {
      ...entry,
      state,
      lastEventAt: lastEvent?.createdAt ?? entry.createdAt,
      lastEventType: lastEvent?.type ?? ENTRY_EVENT_TYPE.CREATED,
    }
  })
}

/**
 * マテリアライズドビュー: 全エントリーとその現在の状態
 *
 * このViewは：
 * - entriesとentry_eventsをjoinして派生
 * - 状態をイベントから計算
 * - リアクティブに更新
 * - 保存されない（常に導出）
 */
export function useEntryStates(): EntryCurrentState[] {
  const { data: entriesWithEvents = [] } = useLiveQuery((query) =>
    query
      .from({ entry: entriesDB })
      .leftJoin({ event: entryEventsDB }, ({ entry, event }) =>
        eq(entry.id, event.entry_id)
      )
      .select(({ entry, event }) => ({
        id: entry.id,
        ticketNumber: entry.number,
        createdAt: entry.created_at,
        token: entry.public_token,
        eventId: event?.id,
        eventType: event?.type,
        eventCreatedAt: event?.created_at,
        eventActor: event?.actor,
      }))
      .orderBy(({ entry }) => entry.number, 'asc')
  )

  return useMemo(() => {
    // Zodスキーマでバリデーション
    const validatedData = z.array(JoinedEntryEventRowSchema).parse(entriesWithEvents)
    return buildEntryStatesFromJoinedData(validatedData)
  }, [entriesWithEvents])
}

/**
 * マテリアライズドビュー: 状態でフィルタリングされたエントリー
 *
 * useEntryStatesから派生したView
 * - 特定の状態のエントリーのみ
 * - リアクティブ
 */
export function useEntriesByState(state: EntryState): EntryCurrentState[] {
  const entryStates = useEntryStates()
  return useMemo(
    () => entryStates.filter((entry) => entry.state === state),
    [entryStates, state]
  )
}

/**
 * マテリアライズドビュー: 待ち行列の統計情報
 *
 * useEntryStatesから派生したView
 * - 各状態の件数
 * - 平均待ち時間
 * - リアクティブ
 */
export function useQueueStats(): QueueStats {
  const entryStates = useEntryStates()

  return useMemo(() => {
    const stats = {
      totalWaiting: 0,
      totalCalled: 0,
      totalDone: 0,
      totalCancelled: 0,
      totalSkipped: 0,
      averageWaitTime: 0,
    }

    let totalWaitTimeMs = 0
    let completedCount = 0

    for (const entry of entryStates) {
      switch (entry.state) {
        case 'waiting':
          stats.totalWaiting++
          break
        case 'called':
          stats.totalCalled++
          break
        case 'done':
          stats.totalDone++
          completedCount++
          totalWaitTimeMs +=
            entry.lastEventAt.getTime() - entry.createdAt.getTime()
          break
        case 'cancelled':
          stats.totalCancelled++
          break
        case 'skipped':
          stats.totalSkipped++
          break
      }
    }

    // 平均待ち時間を分単位で計算
    if (completedCount > 0) {
      stats.averageWaitTime = totalWaitTimeMs / completedCount / 1000 / 60
    }

    return stats
  }, [entryStates])
}

/**
 * マテリアライズドビュー: トークンでエントリーを取得（スマホ画面用）
 *
 * クエリレベルでフィルタリング（効率的）
 * - 必要なデータだけ取得
 * - whereでフィルタ
 */
export function useEntryByToken(token: string): EntryCurrentState | undefined {
  const { data: entriesWithEvents = [] } = useLiveQuery((query) =>
    query
      .from({ entry: entriesDB })
      .leftJoin({ event: entryEventsDB }, ({ entry, event }) =>
        eq(entry.id, event.entry_id)
      )
      .where(({ entry }) => eq(entry.public_token, token))
      .select(({ entry, event }) => ({
        id: entry.id,
        ticketNumber: entry.number,
        createdAt: entry.created_at,
        token: entry.public_token,
        eventId: event?.id,
        eventType: event?.type,
        eventCreatedAt: event?.created_at,
        eventActor: event?.actor,
      }))
  )

  return useMemo(() => {
    // Zodスキーマでバリデーション
    const validatedData = z.array(JoinedEntryEventRowSchema).parse(entriesWithEvents)
    const states = buildEntryStatesFromJoinedData(validatedData)
    return states[0]
  }, [entriesWithEvents])
}

/**
 * マテリアライズドビュー: 次の待機中エントリー
 *
 * useWaitingEntriesから派生
 * - ソート済みの最初の1件
 */
export function useNextWaitingEntry(): EntryCurrentState | undefined {
  const waiting = useWaitingEntries()
  return waiting[0]
}

/**
 * マテリアライズドビュー: 番号順にソートされた待機中エントリー
 *
 * useEntriesByStateから派生
 * - waiting状態のみ
 * - 番号順ソート
 */
export function useWaitingEntries(): EntryCurrentState[] {
  const waiting = useEntriesByState('waiting')
  return useMemo(
    () => [...waiting].sort((a, b) => a.ticketNumber - b.ticketNumber),
    [waiting]
  )
}

/**
 * マテリアライズドビュー: 最終イベント時刻でソートされた呼び出し済みエントリー
 *
 * useEntriesByStateから派生
 * - called状態のみ
 * - 最新順ソート
 */
export function useCalledEntries(): EntryCurrentState[] {
  const called = useEntriesByState('called')
  return useMemo(
    () =>
      [...called].sort(
        (a, b) => b.lastEventAt.getTime() - a.lastEventAt.getTime()
      ),
    [called]
  )
}
