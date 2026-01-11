/**
 * インフラストラクチャ層
 * アプリケーション全体で使用する環境変数とその型定義を提供
 */

// 環境変数を再エクスポート
export { clientEnv, LOCAL_NETWORK_BASE_URL } from './env.client'

// 環境変数の型定義を再エクスポート
export type { ClientEnv } from './env.client'
export type { ServerEnv } from './env.server'
