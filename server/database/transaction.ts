import type { Pool, PoolClient } from 'pg';

/**
 * 1つのDBトランザクション内で処理を実行する
 * 処理が成功すれば COMMIT、例外が発生すれば ROLLBACK して例外を投げ直す
 *
 * @param pool PostgreSQL接続プール
 * @param fn トランザクション内で実行する処理（同じ接続を使う）
 * @returns 処理の戻り値
 */
export async function withTransaction<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
