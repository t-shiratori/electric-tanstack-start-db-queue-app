import { createLiveQueryCollection, eq } from '@tanstack/react-db';
import { z } from 'zod';
import type { EntryWithState } from '~/domain/entry';
import { entriesCollection, entryEventsCollection } from '~/infrastructure/database/collections';
import { JoinedEntryEventRowSchema } from '~/infrastructure/database/schemas';
import { buildEntryStatesFromJoinedData } from './helpers';

/**
 * 全エントリーとそのイベントを結合したライブクエリ（アプリ全体で1つだけ作る）
 * フックごとに useLiveQuery で作ると、画面で使うフックの数だけ同じJOINが動くため共有する
 * - 購読者がいる間だけ同期・差分更新される
 * - 購読者がいなくなると gcTime 経過後に破棄される
 */
const joinedEntryEventsQuery = createLiveQueryCollection({
  id: 'joined-entry-events',
  query: (query) =>
    query
      .from({ entry: entriesCollection })
      .leftJoin({ event: entryEventsCollection }, ({ entry, event }) => eq(entry.id, event.entry_id))
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
      .orderBy(({ entry }) => entry.number, 'asc'),
});

const JoinedEntryEventRowsSchema = z.array(JoinedEntryEventRowSchema);

/** サーバー描画時のスナップショット（同期しないため常に空） */
const EMPTY_ENTRY_STATES: EntryWithState[] = [];

/** 画面に変更を伝えるリスナー（useSyncExternalStore から登録される） */
const listeners = new Set<() => void>();

/** 計算済みの状態一覧。ライブクエリが変わったら破棄し、次に読まれたときに1回だけ再計算する */
let cachedEntryStates: EntryWithState[] | undefined;

/** ライブクエリの購読。最初のリスナーで開始し、最後のリスナーが外れたら解除する */
let subscription: { unsubscribe: () => void } | undefined;

function notifyChange(changes: readonly unknown[]): void {
  // 変更が0件の通知（初期状態が空のときなど）では計算済みの結果をそのまま使う
  if (changes.length === 0) return;
  cachedEntryStates = undefined;
  for (const listener of listeners) {
    listener();
  }
}

/**
 * 状態一覧の変更を購読する
 * 何個のフックから購読されても、ライブクエリの購読は1つだけ
 * @param listener 変更時に呼ばれる関数
 * @returns 購読解除する関数
 */
export function subscribeEntryStates(listener: () => void): () => void {
  listeners.add(listener);
  if (!subscription) {
    subscription = joinedEntryEventsQuery.subscribeChanges(notifyChange, { includeInitialState: true });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && subscription) {
      subscription.unsubscribe();
      subscription = undefined;
      cachedEntryStates = undefined;
    }
  };
}

/**
 * 現在の状態一覧を返す
 * Zodでの検証と状態の計算は、ライブクエリが変わってから最初に呼ばれたときだけ行う
 * （同じ変更に対して何個のフックから呼ばれても計算は1回）
 * @returns 整理券番号の昇順に並んだ状態一覧
 */
export function getEntryStatesSnapshot(): EntryWithState[] {
  if (!cachedEntryStates) {
    const rows = JoinedEntryEventRowsSchema.parse(joinedEntryEventsQuery.toArray);
    cachedEntryStates = buildEntryStatesFromJoinedData(rows);
  }
  return cachedEntryStates;
}

/**
 * サーバー描画時の状態一覧を返す
 * @returns 空の状態一覧
 */
export function getServerEntryStatesSnapshot(): EntryWithState[] {
  return EMPTY_ENTRY_STATES;
}
