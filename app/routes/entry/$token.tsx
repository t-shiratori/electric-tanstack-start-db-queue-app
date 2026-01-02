import { createFileRoute } from '@tanstack/react-router'
import { useEntryByToken, useWaitingEntries, cancelEntry } from '~/db'

export const Route = createFileRoute('/entry/$token')({
  component: EntryComponent,
})

/**
 * スマホ画面
 * - トークンベースのエントリー検索
 * - 個別エントリーの状態表示
 * - 待ち行列の位置表示
 * - リアルタイム更新
 */
function EntryComponent() {
  const { token } = Route.useParams()
  const entry = useEntryByToken(token)
  const waitingEntries = useWaitingEntries()

  /**
   * 待ち行列での順位を計算
   */
  const getQueuePosition = (): number | null => {
    if (!entry || entry.state !== 'waiting') {
      return null
    }

    const position = waitingEntries.findIndex((e) => e.id === entry.id)
    return position >= 0 ? position + 1 : null
  }

  /**
   * エントリーをキャンセル
   */
  const handleCancel = async () => {
    if (!entry) return

    if (!confirm('整理券をキャンセルしますか？')) {
      return
    }

    const result = await cancelEntry(entry.id, 'user')
    if (!result.success) {
      alert(`キャンセルエラー: ${result.error}`)
    }
  }

  const queuePosition = getQueuePosition()

  // エントリーが見つからない場合
  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6 text-gray-300">—</div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            エントリーが見つかりません
          </h1>
          <p className="text-gray-600 mb-8 font-light">
            トークン「{token}」に対応するエントリーが存在しないか、既に削除されています。
          </p>
          <div className="text-sm text-gray-500 font-mono">{token}</div>
        </div>
      </div>
    )
  }

  // 状態に応じた表示
  const getStatusDisplay = () => {
    switch (entry.state) {
      case 'waiting':
        return {
          icon: '⏳',
          title: '待機中',
          color: 'yellow',
          message: 'お呼びするまでお待ちください',
        }
      case 'called':
        return {
          icon: '🔔',
          title: '呼び出し中',
          color: 'blue',
          message: 'カウンターにお越しください！',
        }
      case 'done':
        return {
          icon: '✅',
          title: '完了',
          color: 'green',
          message: 'ご利用ありがとうございました',
        }
      case 'skipped':
        return {
          icon: '⏭',
          title: 'スキップ',
          color: 'orange',
          message: '次回お越しください',
        }
      case 'cancelled':
        return {
          icon: '❌',
          title: 'キャンセル済み',
          color: 'red',
          message: 'このエントリーはキャンセルされました',
        }
    }
  }

  const status = getStatusDisplay()

  const getStatusColor = () => {
    switch (entry.state) {
      case 'waiting':
        return 'bg-gray-200 text-gray-900 border-2 border-gray-300'
      case 'called':
        return 'bg-gray-900 text-white border-2 border-gray-900'
      case 'done':
        return 'bg-gray-200 text-gray-900 border-2 border-gray-300'
      case 'skipped':
        return 'bg-gray-200 text-gray-900 border-2 border-gray-300'
      case 'cancelled':
        return 'bg-gray-200 text-gray-900 border-2 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto py-8">
        {/* メインカード */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden mb-6">
          {/* ヘッダー */}
          <div className={`${getStatusColor()} p-10 text-center`}>
            <div className="text-6xl mb-3">{status.icon}</div>
            <div className="text-xl font-medium tracking-wide">
              {status.title}
            </div>
          </div>

          {/* 整理券番号 */}
          <div className="p-10 text-center bg-white">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              整理券番号
            </div>
            <div className="text-9xl font-semibold text-gray-900 mb-6">
              {entry.ticketNumber}
            </div>

            <div className="text-lg text-gray-700 mb-8 font-light">
              {status.message}
            </div>

            {/* 待機中の場合は順位を表示 */}
            {entry.state === 'waiting' && queuePosition !== null && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 mb-6">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  あなたの前に待っている人
                </div>
                <div className="text-6xl font-semibold text-gray-900 mb-2">
                  {queuePosition - 1}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  現在 {queuePosition} 番目
                </div>
              </div>
            )}

            {/* 呼び出し中の場合は強調表示 */}
            {entry.state === 'called' && (
              <div className="bg-gray-900 border-2 border-gray-900 rounded-lg p-8 mb-6">
                <div className="text-2xl font-medium text-white mb-3">
                  カウンターへどうぞ
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  呼び出し時刻:{' '}
                  {new Date(entry.lastEventAt).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}

            {/* トークン情報 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-2 font-medium">
                アクセストークン
              </div>
              <div className="font-mono text-sm text-gray-700">
                {entry.token}
              </div>
            </div>
          </div>

          {/* キャンセルボタン（待機中または呼び出し中のみ） */}
          {(entry.state === 'waiting' || entry.state === 'called') && (
            <div className="p-6 bg-gray-50 border-t-2 border-gray-200">
              <button
                onClick={handleCancel}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-full hover:border-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>

        {/* 詳細情報 */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            詳細情報
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">受付日時</span>
              <span className="text-gray-900 font-medium">
                {new Date(entry.createdAt).toLocaleString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">最終更新</span>
              <span className="text-gray-900 font-medium">
                {new Date(entry.lastEventAt).toLocaleString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">状態</span>
              <span className="text-gray-900 font-medium">{status.title}</span>
            </div>
            {entry.state === 'waiting' && waitingEntries.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">待機人数</span>
                <span className="text-gray-900 font-medium">
                  {waitingEntries.length}人
                </span>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-gray-500 text-sm font-light">
          <p>画面は自動的に更新されます</p>
        </div>
      </div>
    </div>
  )
}
