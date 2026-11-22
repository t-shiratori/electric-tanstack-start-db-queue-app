import { clientEnv } from '~/infrastructure/env/env.client';
import { parsePgTimestamp } from './pg-timestamp';

/**
 * ElectricSQL接続設定
 * TanStack DBコレクションで使用される共通設定
 * - created_at は TIMESTAMPTZ 型。PostgreSQL 形式の文字列を ISO 8601 に整形して Date に変換する
 * - timestamp（タイムゾーンなし）は UTC として扱う（移行前のデータ構造への備え）
 */
export const electricConfig = {
  url: clientEnv.VITE_ELECTRIC_URL,
  parser: {
    timestamp: parsePgTimestamp,
    timestamptz: parsePgTimestamp,
  },
};
