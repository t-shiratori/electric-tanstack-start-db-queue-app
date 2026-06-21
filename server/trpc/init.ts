import { initTRPC } from '@trpc/server';
import type { Context } from './context';

/**
 * tRPC初期化
 * アプリケーション全体で使用するtRPCインスタンスを作成
 */
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
