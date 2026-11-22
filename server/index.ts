import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/router';

const app = new Hono();

// CORS設定（開発時にViteからのリクエストを許可）
app.use(
  '/trpc/*',
  cors({
    origin: ['http://localhost:5173', 'https://localhost:5173'],
    credentials: true,
  }),
);

// tRPCミドルウェア
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

// ヘルスチェックエンドポイント
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.TRPC_PORT) || 3001;

console.log(`🔥 Hono + tRPC server starting on port ${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`✅ Server is running on http://localhost:${info.port}`);
    console.log(`   tRPC endpoint: http://localhost:${info.port}/trpc`);
  },
);
