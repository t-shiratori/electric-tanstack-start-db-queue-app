import { clientEnv } from '~/infrastructure/env/env.client'

/**
 * ElectricSQL接続設定
 * TanStack DBコレクションで使用される共通設定
 */
export const electricConfig = {
  url: clientEnv.VITE_ELECTRIC_URL,
  parser: {
    timestamptz: (value: string) => new Date(value),
  },
}

/**
 * ElectricSQL同期を初期化
 * アプリケーション起動時に呼び出される
 */
export function initElectricSync() {
  console.log('ElectricSQL sync initialized with URL:', electricConfig.url)
}
