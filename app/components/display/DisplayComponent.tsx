import { useQueueStats, useCalledEntries } from '~/query'

/**
 * 表示端末画面
 * - 読み取り専用の表示
 * - 待機件数の表示
 * - 呼び出し済みエントリーの表示
 * - 自動更新（リアクティブ）
 */
export default function DisplayComponent() {
  const stats = useQueueStats()
  const calledEntries = useCalledEntries()

  // 最新の3件を表示
  const recentCalled = calledEntries.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-12">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-semibold text-white mb-4 tracking-tight">
            Queue System
          </h1>
          <div className="text-gray-300 text-lg font-light">
            {new Date().toLocaleString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-10 text-center border-2 border-white border-opacity-20">
            <div className="text-7xl font-semibold text-gray-800 mb-3">
              {stats.totalWaiting}
            </div>
            <div className="text-gray-800 text-lg font-medium">待機中</div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-10 text-center border-2 border-white border-opacity-20">
            <div className="text-7xl font-semibold text-gray-800 mb-3">
              {stats.totalCalled}
            </div>
            <div className="text-gray-800 text-lg font-medium">呼び出し中</div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-10 text-center border-2 border-white border-opacity-20">
            <div className="text-7xl font-semibold text-gray-800 mb-3">
              {stats.averageWaitTime.toFixed(0)}
            </div>
            <div className="text-gray-800 text-lg font-medium">
              平均待ち時間 (分)
            </div>
          </div>
        </div>

        {/* 呼び出し中のエントリー */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-12 border-2 border-white border-opacity-20">
          <h2 className="text-3xl font-semibold text-white mb-10 text-center">
            呼び出し中
          </h2>

          {recentCalled.length > 0 ? (
            <div className="space-y-5">
              {recentCalled.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`bg-white bg-opacity-15 rounded-xl p-8 flex items-center justify-between transition-all border-2 ${
                    index === 0
                      ? 'border-white border-opacity-40 shadow-2xl'
                      : 'border-white border-opacity-10'
                  }`}
                >
                  <div className="flex items-center gap-8">
                    {index === 0 && (
                      <div className="bg-white bg-opacity-30 text-gray-800 font-medium text-xs px-4 py-2 rounded-full">
                        最新
                      </div>
                    )}
                    <div className="text-8xl font-semibold text-gray-800">
                      {entry.ticketNumber}
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 mb-1 font-medium">
                        呼び出し時刻
                      </div>
                      <div className="text-2xl font-medium text-gray-800">
                        {new Date(entry.lastEventAt).toLocaleTimeString(
                          'ja-JP',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 text-gray-800 opacity-20">—</div>
              <div className="text-2xl text-gray-800 font-light">
                呼び出し中のエントリーはありません
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center mt-16 text-gray-400 text-sm font-light">
          <p>画面は自動的に更新されます</p>
        </div>
      </div>
    </div>
  )
}
