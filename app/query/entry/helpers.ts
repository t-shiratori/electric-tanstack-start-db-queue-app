import type { EntryEvent, EntryWithState } from '~/domain/entry';
import { type DbEventType, ENTRY_EVENT_TYPE, toDomainEventType } from '~/domain/entry/event-types';
import { calculateCurrentState } from '~/domain/entry/state';
import type { JoinedEntryEventRow } from '~/infrastructure/database/schemas';

/**
 * join結果からEntryWithStateの配列を構築するヘルパー関数
 * DB型をドメイン型に変換しながら処理する
 */
export function buildEntryStatesFromJoinedData(joinedData: JoinedEntryEventRow[]): EntryWithState[] {
  // エントリーIDでグループ化
  const entriesMap = new Map<
    string,
    {
      entry: {
        id: string;
        ticketNumber: number;
        createdAt: Date;
        token: string;
      };
      events: EntryEvent[];
    }
  >();

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
      });
    }

    // イベントが存在する場合のみ追加
    // DB型からドメイン型に変換
    if (row.eventId && row.eventType && row.eventActor && row.eventCreatedAt) {
      const entryData = entriesMap.get(row.id);
      if (!entryData) continue;
      entryData.events.push({
        id: row.eventId,
        entryId: row.id,
        type: toDomainEventType(row.eventType as DbEventType),
        createdAt: row.eventCreatedAt,
        actor: row.eventActor,
      });
    }
  }

  // 各エントリーの現在の状態を計算
  return Array.from(entriesMap.values()).map(({ entry, events }) => {
    const state = calculateCurrentState(events);

    const sortedEvents = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const lastEvent = sortedEvents[0];

    return {
      ...entry,
      state,
      lastEventAt: lastEvent?.createdAt ?? entry.createdAt,
      lastEventType: lastEvent?.type ?? ENTRY_EVENT_TYPE.CREATED,
    };
  });
}
