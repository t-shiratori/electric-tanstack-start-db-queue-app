import {
  ClipboardDocumentListIcon,
  MegaphoneIcon,
  TvIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function HomeComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-semibold tracking-tight text-gray-900 mb-4">
            Queue System
          </h1>
          <p className="text-xl text-gray-600 font-light">
            スマートな順番待ち管理システム
          </p>
        </div>

        {/* グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* 受付端末 */}
          <a
            href="/staff/reception"
            className="group relative bg-white border-2 border-gray-200 rounded-xl p-12 hover:border-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-start">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-700 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                受付端末
              </h2>
              <p className="text-gray-600 font-light">
                新規エントリーの作成と整理券の発行
              </p>
            </div>
            <ArrowRightIcon className="absolute bottom-8 right-8 w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </a>

          {/* 呼び出し端末 */}
          <a
            href="/staff/call"
            className="group relative bg-white border-2 border-gray-200 rounded-xl p-12 hover:border-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-start">
              <MegaphoneIcon className="w-12 h-12 text-gray-700 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                呼び出し端末
              </h2>
              <p className="text-gray-600 font-light">
                エントリーの呼び出しと対応管理
              </p>
            </div>
            <ArrowRightIcon className="absolute bottom-8 right-8 w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </a>

          {/* 表示端末 */}
          <a
            href="/display"
            className="group relative bg-white border-2 border-gray-200 rounded-xl p-12 hover:border-gray-900 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-start">
              <TvIcon className="w-12 h-12 text-gray-700 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                表示端末
              </h2>
              <p className="text-gray-600 font-light">
                待ち行列状況のリアルタイム表示
              </p>
            </div>
            <ArrowRightIcon className="absolute bottom-8 right-8 w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </a>

          {/* スマホ画面 */}
          <div className="relative bg-white border-2 border-gray-200 rounded-xl p-12 opacity-50">
            <div className="flex flex-col items-start">
              <DevicePhoneMobileIcon className="w-12 h-12 text-gray-700 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                スマホ画面
              </h2>
              <p className="text-gray-600 font-light">QRコードでアクセス</p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-500 font-light">
            ElectricSQL × TanStack による リアルタイム同期システム
          </p>
        </div>
      </div>
    </div>
  )
}
