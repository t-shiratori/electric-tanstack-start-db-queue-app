import pg from 'pg'
import { serverEnv } from '~/infrastructure/env/env.server'

const { Pool } = pg

/**
 * PostgreSQL接続プール
 * サーバーサイドでのDB直接操作に使用
 */
export const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
})
