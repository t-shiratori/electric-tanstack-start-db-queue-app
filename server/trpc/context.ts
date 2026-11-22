import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { Context as HonoContext } from 'hono';
import { pool } from '../database/pool';

/**
 * tRPCコンテキスト型
 * @property pool PostgreSQL接続プール
 */
export interface Context {
  pool: typeof pool;
  [key: string]: unknown;
}

/**
 * tRPCコンテキスト作成関数
 * リクエストごとに呼び出される
 */
export function createContext(_opts: FetchCreateContextFnOptions, _c: HonoContext): Context {
  return {
    pool,
  };
}
