
# プロジェクト構成

このプロジェクトはクリーンアーキテクチャに基づき、以下の層構造で構成されています。

## ディレクトリ構造

```
app/
├── components/          # UIコンポーネント層
│   ├── home/           # ホーム画面
│   ├── entry/          # エントリー（スマホ）画面
│   ├── display/        # 表示端末画面
│   └── staff/          # スタッフ用画面
│       ├── reception/  # 受付端末
│       └── call/       # 呼び出し端末
│
├── routes/             # TanStack Routerのルート定義
│   ├── __root.tsx      # ルートレイアウト
│   ├── index.tsx       # ホーム画面
│   ├── entry/
│   │   └── $token.tsx  # トークン別エントリー画面
│   ├── display/
│   │   └── index.tsx   # 表示端末画面
│   └── staff/
│       ├── reception/  # 受付端末画面
│       └── call/       # 呼び出し端末画面
│
├── usecases/           # ユースケース層（ビジネスロジック）
│   ├── entry/          # エントリー関連のユースケース
│   │   ├── create-entry.ts        # エントリー作成
│   │   ├── call-entry.ts          # エントリー呼び出し
│   │   ├── mark-entry-done.ts     # エントリー完了
│   │   ├── skip-entry.ts          # エントリースキップ
│   │   ├── cancel-entry.ts        # エントリーキャンセル
│   │   ├── generate-token.ts      # トークン生成
│   │   └── add-entry-event.ts     # イベント追加
│   ├── queue/          # キュー関連のユースケース
│   │   └── get-next-ticket-number.ts  # 次の整理券番号取得
│   └── types.ts        # ユースケース共通型定義
│
├── domain/             # ドメイン層（ビジネスルール）
│   ├── entry/          # エントリードメイン
│   │   ├── types.ts       # エントリー型定義
│   │   ├── event-types.ts # イベント型定義
│   │   ├── constants.ts   # 定数定義
│   │   └── state.ts       # 状態計算ロジック（イベントソーシング）
│   ├── queue/          # キュードメイン
│   │   └── types.ts       # キュー型定義
│   └── repositories/   # リポジトリインターフェース定義
│       ├── entry-repository.ts        # エントリーリポジトリ
│       └── entry-event-repository.ts  # イベントリポジトリ
│
├── infrastructure/     # インフラ層（外部システム接続）
│   ├── database/       # データベース関連
│   │   ├── client.ts      # ElectricSQL クライアント
│   │   ├── pool.ts        # PostgreSQL 接続プール
│   │   ├── schemas.ts     # Zodスキーマ定義
│   │   ├── collections.ts # TanStack DB コレクション設定
│   │   ├── server-functions.ts  # サーバー関数
│   │   └── mappers/       # データマッパー
│   │       ├── entry-mapper.ts       # エントリーマッパー
│   │       └── entry-event-mapper.ts # イベントマッパー
│   ├── repositories/   # リポジトリ実装
│   │   ├── factory.ts                        # リポジトリファクトリー
│   │   ├── electric-entry-repository.ts      # ElectricSQLエントリーリポジトリ
│   │   └── electric-entry-event-repository.ts # ElectricSQLイベントリポジトリ
│   └── env/            # 環境変数管理
│       ├── env.server.ts  # サーバーサイド環境変数
│       └── env.client.ts  # クライアントサイド環境変数
│
├── query/              # データ取得層（React Query統合）
│   └── entry/          # エントリークエリ
│       ├── types.ts       # クエリ型定義
│       ├── helpers.ts     # ヘルパー関数
│       └── hooks.ts       # React Queryフック
│
└── utils/              # ユーティリティ
    └── uuid.ts         # UUID生成

migrations/             # データベースマイグレーション
scripts/                # ビルド・デプロイスクリプト
```

## 層の責務

### 1. Components層 (app/components/)
- UIの描画とユーザーインタラクション
- ユースケースを呼び出し
- 状態管理は最小限（UIの状態のみ）

### 2. Routes層 (app/routes/)
- TanStack Routerによるルーティング定義
- ページレベルのコンポーネント配置
- URL設計

### 3. Usecases層 (app/usecases/)
- アプリケーション固有のビジネスロジック
- ドメイン層とインフラ層を組み合わせた処理フロー
- トランザクション境界の定義

### 4. Domain層 (app/domain/)
- ビジネスルール（状態計算ロジックなど）
- ドメインモデルの型定義
- リポジトリのインターフェース定義
- イベントソーシングの状態計算ロジック

### 5. Infrastructure層 (app/infrastructure/)
- 外部システムとの接続実装
- ElectricSQL、PostgreSQLとの通信
- リポジトリインターフェースの具体実装
- データベーススキーマとマッパー

### 6. Query層 (app/query/)
- React Queryフックの定義
- データ取得とキャッシュ管理
- TanStack DBコレクションとの統合

## アーキテクチャの特徴

### イベントソーシング
- エントリーの状態は `entry_event` テーブルのイベントログから計算
- [domain/entry/state.ts](app/domain/entry/state.ts) に状態計算ロジックを集約
- マテリアライズドビューパターンで現在の状態を派生

### リポジトリパターン
- ドメイン層でインターフェースを定義
- インフラ層で具体的な実装を提供
- ファクトリーパターンで依存性注入

### Local-First
- ElectricSQLによるローカルDB同期
- オフライン対応
- リアルタイム更新

## 依存関係の方向

```
Components/Routes
    ↓
Usecases
    ↓
Domain ← Infrastructure
    ↓
Query
```

- 上位層は下位層に依存可能
- 下位層は上位層に依存不可
- Infrastructure層のみDomain層のインターフェースを実装
