
# 技術スタック

## コアフレームワーク・ライブラリ

### フロントエンド
- **React** 19.2.3
  - UIライブラリ
  - 最新のReact 19を使用
- **TanStack Start** 1.149.2
  - React用のフルスタックフレームワーク
  - SSRとクライアントサイドの統合
  - ファイルベースルーティング
- **TanStack Router** 1.147.3
  - 型安全なルーティング
  - ネストされたルートのサポート
- **TanStack DB** 0.1.38
  - ローカルファーストのデータ管理
  - ElectricSQLとの統合

### スタイリング
- **Tailwind CSS** 4.1.18
  - ユーティリティファーストCSSフレームワーク
  - v4の最新機能を使用
- **@tailwindcss/vite** 4.1.18
  - Vite統合プラグイン
- **PostCSS** 8.4.49
  - CSS変換ツール
- **Autoprefixer** 10.4.20
  - ベンダープレフィックス自動付与
- **@heroicons/react** 2.2.0
  - Heroiconsアイコンライブラリ

### データベース・同期

### データベース
- **PostgreSQL** 17
  - メインデータベース
  - WALレベル: logical（レプリケーション対応）
- **pg** 8.16.3
  - Node.js PostgreSQLクライアント
  - サーバーサイドでの直接接続用

### 同期・Local-First
- **ElectricSQL** 1.2.0
  - PostgreSQLのローカル同期
  - リアルタイムデータ同期
  - オフライン対応
  - Shape API経由でデータ配信
- **@tanstack/electric-db-collection** 0.2.5
  - ElectricSQLとTanStack DBの統合
  - コレクションベースのデータ管理

### バリデーション・型安全性

- **TypeScript** 5.7.2
  - 型安全な開発環境
  - ES2022ターゲット
  - strict モード有効
- **Zod** 4.3.4
  - スキーマバリデーション
  - 環境変数の検証
  - データベーススキーマ定義
  - 型推論によるTypeScript型生成

### ビルド・開発ツール

### バンドラー・ビルドツール
- **Vite** 7.3.0
  - 高速ビルドツール
  - HMR（Hot Module Replacement）
  - 開発サーバー
- **@vitejs/plugin-react** 4.6.0
  - React用Viteプラグイン
  - Fast Refresh対応
- **vite-tsconfig-paths** 5.1.4
  - TypeScriptのpathマッピング対応

### コード品質
- **ESLint** 9.17.0
  - 静的コード解析
  - TypeScript対応
- **typescript-eslint** 8.20.0
  - TypeScript用ESLintプラグイン
- **Prettier** 3.4.2
  - コードフォーマッター
  - セミコロンなし設定
  - シングルクォート使用

## ユーティリティ

- **qrcode** 1.5.4
  - QRコード生成
  - エントリートークンのQR表示用

## インフラ・デプロイ

### Webサーバー
- **Caddy** (latest)
  - リバースプロキシ
  - 自動HTTPS（開発環境用自己署名証明書）
  - ローカルネットワーク対応

### コンテナ
- **Docker Compose**
  - PostgreSQL 17
  - ElectricSQL
  - ボリューム永続化

### パッケージ管理
- **pnpm** 10.19.0
  - 高速なパッケージマネージャー
  - ディスク効率的
  - monorepo対応

### ツールバージョン管理
- **mise** (開発環境)
  - Node.js 22
  - pnpm latest
  - Caddy latest
  - 統一された開発環境

## 環境変数管理

### クライアント側（VITE_プレフィックス）
- `VITE_LOCAL_IP_ADDRESS`: ローカルネットワークIPアドレス（IPv4）
- `VITE_LOCAL_HOSTNAME`: ローカル開発用ホスト名
- `VITE_ELECTRIC_URL`: ElectricSQL Shape APIエンドポイント（HTTPS必須）

### サーバー側
- `DATABASE_URL`: PostgreSQL接続URL（postgresql://形式）

すべての環境変数はZodスキーマで型安全に検証されています。

## データベーススキーマ

### テーブル構成
1. **queue**: 店舗/窓口管理
   - UUID主キー
   - 店舗名、ステータス
2. **entry**: 受付情報（イベントソーシングの主体）
   - UUID主キー
   - 整理券番号、人数、公開トークン
   - 状態は保持せず、イベントから派生
3. **entry_event**: イベントログ（append-only）
   - UUID主キー
   - イベントタイプ（created/called/done/skipped/cancelled）
   - 操作者情報（staff/system/user）
   - デバイスID

### インデックス
- queue_id、number、public_token
- entry_id、created_at（降順）、type

## 開発フロー

1. **ローカル開発**
   - Vite開発サーバー（ポート5173）
   - Caddy HTTPSプロキシ
   - HMR（Hot Module Replacement）
2. **データベース**
   - Docker Composeで起動
   - マイグレーションSQLで初期化
3. **型安全性**
   - TypeScript strict mode
   - Zod実行時バリデーション
   - TanStack Routerの型安全ルーティング
4. **コード品質**
   - ESLint自動チェック
   - Prettier自動整形

