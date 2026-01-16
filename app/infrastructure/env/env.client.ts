import { z } from 'zod';

/**
 * クライアント側環境変数のスキーマ
 * import.meta.envから読み込まれる変数を定義・検証
 * VITE_プレフィックスが必須
 *
 * 注意: このファイルはクライアント側でのみインポートすること
 */
const clientEnvSchema = z.object({
  /**
   * ローカルネットワークのIPアドレス
   * 開発環境でスマートフォンからアクセスする際に使用
   * 形式: xxx.xxx.xxx.xxx (IPv4)
   */
  VITE_LOCAL_IP_ADDRESS: z.ipv4(),

  /**
   * ローカル開発用のホスト名
   * .localhostドメインは自動的に127.0.0.1に解決される
   */
  VITE_LOCAL_HOSTNAME: z.string().min(1, 'VITE_LOCAL_HOSTNAME is required').describe('Local development hostname'),

  /**
   * ElectricSQL Shape APIのベースURL
   * クライアントから直接アクセスする公開エンドポイント
   * セキュリティのためHTTPSのみを許可
   */
  VITE_ELECTRIC_URL: z.url({ protocol: /^https$/ }),
});

/**
 * 検証済みクライアント環境変数
 * クライアント側コードで使用する環境変数
 * SSR環境では評価されないため、ClientOnly内でのみ使用すること
 *
 * 注意: クライアント側でのみ使用可能
 */
export const clientEnv = clientEnvSchema.parse(import.meta.env);

/**
 * クライアント環境変数の型
 * TypeScript型推論により自動生成
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * ローカルネットワークからアクセス可能なベースURL
 *
 * Caddyサーバーを経由してアクセスする場合、HTTPSで提供されます。
 * スマートフォンなど他のデバイスからアクセスできるように、
 * ローカルネットワークのIPアドレスを使用します。
 *
 * @example "https://192.168.11.8"
 */
export const LOCAL_NETWORK_BASE_URL = `https://${clientEnv.VITE_LOCAL_IP_ADDRESS}` as const;
