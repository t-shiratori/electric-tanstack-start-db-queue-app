import { entryRouter } from '../routers/entry';
import { queueRouter } from '../routers/queue';
import { router } from './init';

/**
 * メインアプリケーションルーター
 * すべてのサブルーターを統合
 */
export const appRouter = router({
  entry: entryRouter,
  queue: queueRouter,
});

/**
 * AppRouter型
 * クライアント側での型推論に使用
 */
export type AppRouter = typeof appRouter;
