import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';
import { useState } from 'react';
import type { Uuid } from '~/infrastructure/database/schemas';
import { LOCAL_NETWORK_BASE_URL } from '~/infrastructure/env/env.client';
import { getEntryEventRepository, getEntryRepository } from '~/infrastructure/repositories';
import { useQueueStats, useWaitingEntries } from '~/query';
import { createEntry } from '~/usecases/entry';
import { getNextTicketNumber } from '~/usecases/queue';

/**
 * 受付端末画面
 * - 新規エントリー作成
 * - 現在の待ち行列状況表示
 * - トークン/QRコード生成・表示
 */
export default function ReceptionComponent() {
  const stats = useQueueStats();
  const waitingEntries = useWaitingEntries();
  const [partySize, setPartySize] = useState(1);
  const [createdEntry, setCreatedEntry] = useState<{
    ticketNumber: number;
    token: string;
    qrCodeUrl: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 固定のキューID（将来的には複数キュー対応も可能）
  // RFC 4122準拠のUUID v4をデフォルトキューとして使用
  const QUEUE_ID: Uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  /**
   * 新規エントリーを作成
   */
  const handleCreateEntry = async () => {
    setIsCreating(true);
    try {
      // 次の整理券番号（仮）を取得。確定番号はエントリー作成時にサーバーで採番される
      const nextNumberResult = await getNextTicketNumber(QUEUE_ID);
      if ('error' in nextNumberResult) {
        alert(`番号取得エラー: ${nextNumberResult.error}`);
        return;
      }

      // エントリーを作成
      const result = await createEntry(
        getEntryRepository(),
        getEntryEventRepository(),
        QUEUE_ID,
        nextNumberResult.number,
        partySize,
      );

      if (!result.success) {
        alert(`エントリー作成エラー: ${result.error}`);
        return;
      }

      // QRコードを生成
      // ローカルネットワークからアクセス可能なURLを生成
      const entryUrl = `${LOCAL_NETWORK_BASE_URL}/entry/${result.token}`;

      console.log('Entry URL:', entryUrl);

      const qrCodeUrl = await QRCode.toDataURL(entryUrl, {
        width: 300,
        margin: 2,
      });

      setCreatedEntry({
        ticketNumber: result.ticketNumber ?? nextNumberResult.number,
        token: result.token ?? '',
        qrCodeUrl,
      });
    } catch (error) {
      console.error('Entry creation error:', error);
      alert('エントリー作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * 作成完了画面を閉じる
   */
  const handleCloseCreated = () => {
    setCreatedEntry(null);
    setPartySize(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">受付端末</h1>
            <p className="text-gray-600 font-light">新規エントリーの作成と整理券の発行</p>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            ホーム
          </a>
        </div>

        {/* 作成完了モーダル */}
        {createdEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-12 max-w-md w-full">
              <div className="text-center">
                <div className="text-7xl font-light text-gray-900 mb-2">{createdEntry.ticketNumber}</div>
                <div className="text-sm text-gray-400 mb-8 font-light tracking-wide">整理券番号</div>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <img src={createdEntry.qrCodeUrl} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-gray-500 mt-4 font-light">QRコードを読み取って状況を確認</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                  <p className="text-xs text-gray-400 mb-2 font-light">アクセストークン</p>
                  <p className="font-mono text-sm text-gray-700">{createdEntry.token}</p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseCreated}
                  className="w-full bg-gray-900 text-white font-light py-4 px-6 rounded-full hover:bg-gray-800 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム: エントリー作成 */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">新規エントリー</h2>

            <div className="mb-8">
              <span className="flex items-center gap-2 text-sm text-gray-700 mb-4 font-medium">
                <UserGroupIcon className="w-5 h-5" />
                人数を選択
              </span>
              <div className="grid grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setPartySize(size)}
                    className={`aspect-square rounded-lg font-medium transition-all border-2 ${
                      partySize === size
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateEntry}
              disabled={isCreating}
              className="w-full bg-gray-900 text-white font-medium py-4 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isCreating ? '作成中...' : '整理券を発行'}
            </button>
          </div>

          {/* 右カラム: 待ち行列状況 */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">待ち行列状況</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-4xl font-semibold text-gray-900 mb-1">{stats.totalWaiting}</div>
                <div className="text-sm text-gray-600 font-medium">待機中</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-4xl font-semibold text-gray-900 mb-1">{stats.totalCalled}</div>
                <div className="text-sm text-gray-600 font-medium">呼び出し中</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-4xl font-semibold text-gray-900 mb-1">{stats.totalDone}</div>
                <div className="text-sm text-gray-600 font-medium">完了</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-4xl font-semibold text-gray-900 mb-1">{stats.averageWaitTime.toFixed(1)}</div>
                <div className="text-sm text-gray-600 font-medium">平均 (分)</div>
              </div>
            </div>

            <h3 className="text-sm text-gray-700 mb-3 font-medium">最新の待機エントリー</h3>
            <div className="space-y-2">
              {waitingEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-semibold text-gray-900">{entry.ticketNumber}</div>
                    <div className="text-xs text-gray-500 font-medium">
                      {new Date(entry.createdAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{entry.token}</div>
                </div>
              ))}
              {waitingEntries.length === 0 && (
                <div className="text-center text-gray-500 py-8 font-light">待機中のエントリーはありません</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
