import pg from 'pg';
import { z } from 'zod';

const { Pool } = pg;

/**
 * サーバー環境変数のスキーマ
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
});

const env = serverEnvSchema.parse(process.env);

/**
 * PostgreSQL接続プール
 * サーバーサイドでのDB直接操作に使用
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
