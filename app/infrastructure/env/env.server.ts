import { z } from 'zod';

/**
 * サーバー側環境変数のスキーマ
 * process.envから読み込まれる変数を定義・検証
 *
 * 注意: このファイルはサーバー側でのみインポートすること
 */
const serverEnvSchema = z.object({
  /**
   * PostgreSQLデータベース接続URL
   * 形式: postgresql://user:password@host:port/database
   * protocolオプションでpostgresqlプロトコルのみを許可
   */
  DATABASE_URL: z.url({ protocol: /^postgresql$/ }),
});

/**
 * 検証済みサーバー環境変数
 * アプリケーション起動時にバリデーションが実行される
 * バリデーション失敗時は明確なエラーメッセージと共に起動が中断される
 *
 * 注意: サーバー側（server functions）でのみ使用可能
 */
export const serverEnv = serverEnvSchema.parse(process.env);

/**
 * サーバー環境変数の型
 * TypeScript型推論により自動生成
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
