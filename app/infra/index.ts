import { createClientOnlyFn } from '@tanstack/react-start'

/**
 * インフラストラクチャ層
 * アプリケーション全体で使用するユーティリティ関数を提供
 */

/**
 * URL設定
 * Caddyfileの設定と整合性を保つ必要があります
 *
 * Caddyfile設定:
 * - queue-app.localhost: HTTPS (tls internal - 自己署名証明書)
 * - ローカルIPアドレス: HTTPS (tls internal - 自己署名証明書)
 * - 両方とも VITE_LOCAL_IP_ADDRESS:VITE_DEV_PORT へリバースプロキシ
 */

/**
 * ローカルネットワークのIPアドレス
 * 環境変数 VITE_LOCAL_IP_ADDRESS で設定（必須）
 * .envファイルで設定してください
 */
export const LOCAL_IP_ADDRESS = import.meta.env.VITE_LOCAL_IP_ADDRESS!

/**
 * ローカル開発用のホスト名
 * 環境変数 VITE_LOCAL_HOSTNAME で設定（必須）
 * .envファイルで設定してください
 */
export const LOCAL_HOSTNAME = import.meta.env.VITE_LOCAL_HOSTNAME!

/**
 * プロトコル
 * Caddyを使用している場合はHTTPSになります
 */
export const PROTOCOL = 'https'

/**
 * ElectricSQL Shape APIのベースURL
 * 環境変数 VITE_ELECTRIC_URL で設定（必須）
 * .envファイルで設定してください
 */
export const ELECTRIC_URL = import.meta.env.VITE_ELECTRIC_URL!

/**
 * PostgreSQLデータベース接続URL
 * 環境変数 DATABASE_URL で設定（必須）
 * .envファイルで設定してください
 */
export const DATABASE_URL = process.env.DATABASE_URL!

/**
 * ローカルネットワークからアクセス可能なベースURLを取得
 *
 * Caddyサーバーを経由してアクセスする場合、HTTPSで提供されます。
 * スマートフォンなど他のデバイスからアクセスできるように、
 * ローカルネットワークのIPアドレスを使用します。
 *
 * @returns ベースURL (例: https://192.168.x.x)
 */
export const getNetworkAccessibleBaseUrl = createClientOnlyFn(() => {
  // スマホからアクセスできるようにIPアドレスを使用
  return `${PROTOCOL}://${LOCAL_IP_ADDRESS}`
})
