import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          順番待ちアプリ
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500 text-white font-semibold py-6 px-4 rounded-lg text-center">
            <div className="text-xl mb-2">📝</div>
            <div>受付端末</div>
            <div className="text-xs mt-2">実装予定</div>
          </div>

          <div className="bg-green-500 text-white font-semibold py-6 px-4 rounded-lg text-center">
            <div className="text-xl mb-2">📢</div>
            <div>呼び出し端末</div>
            <div className="text-xs mt-2">実装予定</div>
          </div>

          <div className="bg-purple-500 text-white font-semibold py-6 px-4 rounded-lg text-center">
            <div className="text-xl mb-2">📺</div>
            <div>表示端末</div>
            <div className="text-xs mt-2">実装予定</div>
          </div>

          <div className="bg-gray-300 text-gray-600 font-semibold py-6 px-4 rounded-lg text-center">
            <div className="text-xl mb-2">📱</div>
            <div>スマホ画面</div>
            <div className="text-xs mt-2">QRコードからアクセス</div>
          </div>
        </div>
      </div>
    </div>
  )
}
