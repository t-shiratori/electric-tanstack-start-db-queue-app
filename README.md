# 店舗向け順番待ち（待ち行列）アプリのサンプル

TanStack Start × TanStack DB × ElectricSQL による Local-First アプリケーション

<img width="600" height="" alt="PC管理画面トップ" src="https://github.com/user-attachments/assets/d533f901-7c75-4732-9882-ff551735b5c9" /> </br>

<img width="600" height="" alt="PC管理画面 受付端末画面" src="https://github.com/user-attachments/assets/df77f26b-256e-4bf5-a0de-9811fa91fa6a" /> </br>

<img width="600" height="" alt="PC管理画面 呼び出し端末画面" src="https://github.com/user-attachments/assets/e89a9fa1-2a85-4f01-bae0-991c582d8ba2" /> </br>

<img width="600" height="" alt="PC状況確認画面" src="https://github.com/user-attachments/assets/3de44d35-7c70-4adb-8c3e-22a10730abd4" /> </br>

<img width="300" height="" alt="スマホ待機中" src="https://github.com/user-attachments/assets/e2504d42-7844-4efd-9b3e-e994d61b3bec" /> 

<img width="300" height="" alt="スマホ呼び出し中" src="https://github.com/user-attachments/assets/50f69081-0397-4662-9191-e4059c886c97" />


## 特徴

- **オフライン対応**: ネット未接続でも全操作可能
- **リアルタイム同期**: 複数端末で即座に状態が同期
- **イベントソーシング**: 状態変化をログとして保存し、現在状態を派生
- **1リポジトリ構成**: 全端末（受付・呼び出し・表示・スマホ）を1つのアプリでカバー

## 技術スタック

- **フレームワーク**: TanStack Start (React)
- **スタイリング**: Tailwind CSS v4
- **データベース**: PostgreSQL 17
- **ローカルDB**: TanStack DB
- **同期**: ElectricSQL
- **リント・フォーマット**: Biome
- **パッケージ管理**: pnpm

## セットアップ

### 前提条件

このプロジェクトは[mise](https://mise.jdx.dev/)でツールを管理しています。

miseがインストールされていない場合 [Getting Started | mise-en-place](https://mise.jdx.dev/getting-started.html) を参照してください。

### 1. 開発ツールのインストール

mise.tomlに定義されたツール（Node.js、pnpm、Caddy）を一括インストールします:

```bash
mise install
```

これにより以下がインストールされます:
- Node.js 22
- pnpm (latest)
- Caddy (latest)

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成します:

```bash
cp .env.example .env
```

**重要**: `.env`ファイルを編集して、以下の設定を自分の環境に合わせて変更してください:

```bash
# ローカルネットワークのIPアドレス（スマホからアクセス用）
VITE_LOCAL_IP_ADDRESS=192.168.x.x  ← 自分のIPアドレスに変更

# 開発サーバーのポート（デフォルト: 5173）
VITE_DEV_PORT=5173

# ローカル開発用のホスト名（オプション、デフォルトのままでOK）
VITE_LOCAL_HOSTNAME=queue-app.localhost

# データベース接続URL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME

# ElectricSQL同期URL（自動的にVITE_LOCAL_IP_ADDRESSを使用）
VITE_ELECTRIC_URL=https://${VITE_LOCAL_IP_ADDRESS}/v1/shape

# Hono + tRPCサーバーのポート（省略時: 3001）
# ※ 3000はElectricSQLが使用するため指定しないこと
TRPC_PORT=3001
```

IPアドレスの確認方法:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### 4. Caddyfileの生成

環境変数からCaddyfileを生成します:

```bash
pnpm generate:caddy
```

これにより、`.env`で設定したIPアドレスを使用したCaddyfileが生成されます。

### 5. Caddyの起動（HTTPS開発環境）

このアプリケーションはHTTPS環境で動作することを前提としています（UUID生成にcrypto.randomUUID()を使用するため）。

Caddyを起動してHTTPSリバースプロキシを有効にします:

```bash
caddy run
```

これにより https://queue-app.localhost でアクセス可能になります。

注意: 初回アクセス時にブラウザで自己署名証明書の警告が表示されますが、開発環境では問題ありません。

### 6. Dockerでデータベースを起動

```bash
docker compose up -d
```

このコマンドでPostgreSQLとElectricSQLが起動します。

### 7. データベースの初期化

マイグレーションを番号順に実行してテーブルを作成します。

```bash
docker exec -i queue-app-postgres psql -U postgres -d queue_app < migrations/001_create_tables.sql
docker exec -i queue-app-postgres psql -U postgres -d queue_app < migrations/002_created_at_timestamptz.sql
```

※ `002` は既存のデータベースの `created_at` を `TIMESTAMPTZ` に変換するマイグレーションです。新しく作成したデータベースでは何も変更しません（何度実行しても安全です）。

### 8. 開発サーバーの起動

```bash
pnpm dev
```

Vite開発サーバー（`dev:client`）とHono + tRPCサーバー（`dev:server`）が並列で起動します。個別に起動したい場合は `pnpm dev:client` / `pnpm dev:server` を使用してください。

アプリケーションは http://localhost:5173 (または`.env`で設定したVITE_DEV_PORT) で起動します。tRPCサーバーは http://localhost:3001 (または`.env`で設定したTRPC_PORT) で起動し、Viteの `/trpc` プロキシ経由でアクセスされます。

**推奨**: Caddyを経由してHTTPSでアクセスしてください: https://queue-app.localhost

HTTPSが必要な理由: このアプリはUUID生成に`crypto.randomUUID()`を使用するため、安全なコンテキスト（HTTPS）が必要です。

### データベースの再起動

データベースを完全にリセットして再起動する場合:

```bash
docker compose down -v
docker compose up -d
docker exec -i queue-app-postgres psql -U postgres -d queue_app < migrations/001_create_tables.sql
docker exec -i queue-app-postgres psql -U postgres -d queue_app < migrations/002_created_at_timestamptz.sql
```

## 画面構成

- `/` - ホーム画面（各端末へのリンク）
- `/staff/reception` - 受付端末（新規受付登録）
- `/staff/call` - 呼び出し端末（次を呼ぶ・完了）
- `/display` - 表示端末（待ち状況表示）
- `/entry/[token]` - スマホ画面（QRコードからアクセス）

## データベース設計

### テーブル

- `queue` - 店舗/窓口の管理
- `entry` - 受付情報（状態は持たない）
- `entry_event` - イベントログ（唯一の正のデータ）

### イベント種別

- `created` - 受付
- `called` - 呼び出し
- `done` - 完了
- `skipped` - スキップ
- `cancelled` - キャンセル

## アーキテクチャの特徴

### イベントソーシング

状態（`waiting`, `called`, `done`など）はDBに保存せず、イベントログから計算します。

```
entry_event (ログ) → マテリアライズドビュー → 現在の状態
```

### Local-First

すべての操作はローカルDBで即座に完了し、ElectricSQLが非同期で同期します。

```
操作 → ローカルDB → View更新 → UI反映 → 同期（後から）
```

## 開発

### データベースの確認

PostgreSQLのテーブル内容を確認するには、以下のコマンドを使用します。

```bash
# すべてのテーブル一覧を表示
docker exec queue-app-postgres psql -U postgres -d queue_app -c "\dt"

# queueテーブルの内容を表示
docker exec queue-app-postgres psql -U postgres -d queue_app -c "SELECT * FROM queue;"

# entryテーブルの内容を表示
docker exec queue-app-postgres psql -U postgres -d queue_app -c "SELECT * FROM entry;"

# entry_eventテーブルの内容を表示
docker exec queue-app-postgres psql -U postgres -d queue_app -c "SELECT * FROM entry_event;"

# エントリーとイベントを結合して表示
docker exec queue-app-postgres psql -U postgres -d queue_app -c "
  SELECT e.number, e.party_size, e.public_token,
         ee.type, ee.actor, ee.created_at
  FROM entry e
  LEFT JOIN entry_event ee ON e.id = ee.entry_id
  ORDER BY e.number, ee.created_at;
"
```

### マイグレーションの手動実行

必要に応じてマイグレーションを手動で実行できます（番号順に実行）。

```bash
docker exec -i queue-app-postgres psql -U postgres -d queue_app < migrations/001_create_tables.sql
docker exec -i queue-app-postgres psql -U postgres -d queue_app < migrations/002_created_at_timestamptz.sql
```

### リント・フォーマット

このプロジェクトではBiomeを使用しています。

```bash
# リント（自動修正付き）
pnpm lint

# フォーマット
pnpm format

# リント＋フォーマット（一括）
pnpm check
```

### ビルド

```bash
pnpm build
```

### 本番環境での起動

```bash
pnpm start
```

## ライセンス

MIT
