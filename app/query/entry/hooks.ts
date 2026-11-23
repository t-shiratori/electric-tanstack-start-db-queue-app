import { useMemo, useSyncExternalStore } from 'react';
import type { EntryState, EntryWithState } from '~/domain/entry';
import { getEntryStatesSnapshot, getServerEntryStatesSnapshot, subscribeEntryStates } from './entry-states-store';
import type { QueueStats } from './types';

/**
 * マテリアライズドビュー: 全エントリーとその現在の状態
 *
 * このViewは：
 * - entriesとentry_eventsをjoinして派生
 * - 状態をイベントから計算
 * - リアクティブに更新
 * - 保存されない（常に導出）
 * - JOIN・検証・状態の計算はアプリ全体で1回だけ行い、全フックで結果を共有する
 */
export function useEntryStates(): EntryWithState[] {
  return useSyncExternalStore(subscribeEntryStates, getEntryStatesSnapshot, getServerEntryStatesSnapshot);
}

/**
 * マテリアライズドビュー: 状態でフィルタリングされたエントリー
 *
 * useEntryStatesから派生したView
 * - 特定の状態のエントリーのみ
 * - リアクティブ
 */
export function useEntriesByState(state: EntryState): EntryWithState[] {
  const entryStates = useEntryStates();
  return useMemo(() => entryStates.filter((entry) => entry.state === state), [entryStates, state]);
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
  const entryStates = useEntryStates();

  return useMemo(() => {
    const stats = {
      totalWaiting: 0,
      totalCalled: 0,
      totalDone: 0,
      totalCancelled: 0,
      totalSkipped: 0,
      averageWaitTime: 0,
    };

    let totalWaitTimeMs = 0;
    let completedCount = 0;

    for (const entry of entryStates) {
      switch (entry.state) {
        case 'waiting':
          stats.totalWaiting++;
          break;
        case 'called':
          stats.totalCalled++;
          break;
        case 'done':
          stats.totalDone++;
          completedCount++;
          totalWaitTimeMs += entry.lastEventAt.getTime() - entry.createdAt.getTime();
          break;
        case 'cancelled':
          stats.totalCancelled++;
          break;
        case 'skipped':
          stats.totalSkipped++;
          break;
      }
    }

    // 平均待ち時間を分単位で計算
    if (completedCount > 0) {
      stats.averageWaitTime = totalWaitTimeMs / completedCount / 1000 / 60;
    }

    return stats;
  }, [entryStates]);
}

/**
 * マテリアライズドビュー: トークンでエントリーを取得（スマホ画面用）
 *
 * useEntryStatesから派生したView
 * - 共有の状態一覧から探すため、専用のライブクエリは作らない
 */
export function useEntryByToken(token: string): EntryWithState | undefined {
  const entryStates = useEntryStates();
  return useMemo(() => entryStates.find((entry) => entry.token === token), [entryStates, token]);
}

/**
 * マテリアライズドビュー: 次の待機中エントリー
 *
 * useWaitingEntriesから派生
 * - ソート済みの最初の1件
 */
export function useNextWaitingEntry(): EntryWithState | undefined {
  const waiting = useWaitingEntries();
  return waiting[0];
}

/**
 * マテリアライズドビュー: 番号順にソートされた待機中エントリー
 *
 * useEntriesByStateから派生
 * - waiting状態のみ
 * - 番号順ソート
 */
export function useWaitingEntries(): EntryWithState[] {
  const waiting = useEntriesByState('waiting');
  return useMemo(() => [...waiting].sort((a, b) => a.ticketNumber - b.ticketNumber), [waiting]);
}

/**
 * マテリアライズドビュー: 最終イベント時刻でソートされた呼び出し済みエントリー
 *
 * useEntriesByStateから派生
 * - called状態のみ
 * - 最新順ソート
 */
export function useCalledEntries(): EntryWithState[] {
  const called = useEntriesByState('called');
  return useMemo(() => [...called].sort((a, b) => b.lastEventAt.getTime() - a.lastEventAt.getTime()), [called]);
}
