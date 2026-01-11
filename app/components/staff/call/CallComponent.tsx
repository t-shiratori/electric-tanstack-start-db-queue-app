import {
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  ForwardIcon,
} from '@heroicons/react/24/outline'
import {
  useWaitingEntries,
  useCalledEntries,
  useNextWaitingEntry,
  callEntry,
  markEntryDone,
  skipEntry,
} from '~/db'

/**
 * 呼び出し端末画面
 * - 待機中エントリーの表示
 * - 次のエントリーを呼び出し
 * - 完了/スキップ操作
 * - 呼び出し済みエントリーの表示
 */
export default function CallComponent() {
  const waitingEntries = useWaitingEntries()
  const calledEntries = useCalledEntries()
  const nextEntry = useNextWaitingEntry()

  /**
   * 次のエントリーを呼び出す
   */
  const handleCallNext = async () => {
    if (!nextEntry) {
      alert('呼び出せるエントリーがありません')
      return
    }

    const result = await callEntry(nextEntry.id)
    if (!result.success) {
      alert(`呼び出しエラー: ${result.error}`)
    }
  }

  /**
   * エントリーを完了としてマーク
   */
  const handleMarkDone = async (entryId: string) => {
    const result = await markEntryDone(entryId)
    if (!result.success) {
      alert(`完了処理エラー: ${result.error}`)
    }
  }

  /**
   * エントリーをスキップ
   */
  const handleSkip = async (entryId: string) => {
    if (!confirm('このエントリーをスキップしますか？')) {
      return
    }

    const result = await skipEntry(entryId)
    if (!result.success) {
      alert(`スキップエラー: ${result.error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">
              呼び出し端末
            </h1>
            <p className="text-gray-600 font-light">
              エントリーの呼び出しと対応管理
            </p>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            ホーム
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム: 次の呼び出し */}
          <div className="space-y-8">
            {/* 次の呼び出し */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                次の呼び出し
              </h2>

              {nextEntry ? (
                <div className="text-center">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 mb-6">
                    <div className="text-8xl font-semibold text-gray-900 mb-4">
                      {nextEntry.ticketNumber}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {new Date(nextEntry.createdAt).toLocaleString('ja-JP', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      {nextEntry.token}
                    </div>
                  </div>

                  <button
                    onClick={handleCallNext}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-medium py-5 px-6 rounded-full hover:bg-gray-800 transition-colors text-lg"
                  >
                    <BellIcon className="w-6 h-6" />
                    呼び出す
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <CheckIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <div className="font-light">待機中のエントリーはありません</div>
                </div>
              )}
            </div>

            {/* 待機中リスト */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                待機中 ({waitingEntries.length})
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {waitingEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-semibold text-gray-900">
                        {entry.ticketNumber}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {new Date(entry.createdAt).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {waitingEntries.length === 0 && (
                  <div className="text-center text-gray-500 py-8 font-light">
                    待機中のエントリーはありません
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右カラム: 呼び出し済み */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              呼び出し済み ({calledEntries.length})
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-40px)] overflow-y-auto">
              {calledEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-semibold text-gray-900">
                        {entry.ticketNumber}
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">
                          呼び出し時刻
                        </div>
                        <div className="text-sm text-gray-900 font-medium">
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
                    <div className="text-xs text-gray-500 font-mono">
                      {entry.token}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleMarkDone(entry.id)}
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <CheckIcon className="w-5 h-5" />
                      完了
                    </button>
                    <button
                      onClick={() => handleSkip(entry.id)}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <ForwardIcon className="w-5 h-5" />
                      スキップ
                    </button>
                  </div>
                </div>
              ))}
              {calledEntries.length === 0 && (
                <div className="text-center text-gray-500 py-16 font-light">
                  呼び出し済みのエントリーはありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
