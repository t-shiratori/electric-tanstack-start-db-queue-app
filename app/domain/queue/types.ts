/**
 * 待ち行列の統計情報
 * 全エントリーの状態を集計した結果
 * @property totalWaiting 待機中の件数
 * @property totalCalled 呼び出し済みの件数
 * @property totalDone 完了の件数
 * @property totalCancelled キャンセルの件数
 * @property totalSkipped スキップの件数
 * @property averageWaitTime 平均待ち時間（分）
 */
export interface QueueStats {
  totalWaiting: number;
  totalCalled: number;
  totalDone: number;
  totalCancelled: number;
  totalSkipped: number;
  averageWaitTime: number;
}
