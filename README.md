# 店舗向け順番待ち（待ち行列）アプリ

TanStack Start × TanStack DB × ElectricSQL による Local-First アプリケーション

## 特徴

- **オフライン対応**: ネット未接続でも全操作可能
- **リアルタイム同期**: 複数端末で即座に状態が同期
- **イベントソーシング**: 状態変化をログとして保存し、現在状態を派生
- **1リポジトリ構成**: 全端末（受付・呼び出し・表示・スマホ）を1つのアプリでカバー

## 技術スタック

- **フレームワーク**: TanStack Start (React)
- **スタイリング**: Tailwind CSS v4
- **データベース**: PostgreSQL
- **ローカルDB**: TanStack DB
- **同期**: ElectricSQL
- **パッケージ管理**: pnpm

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. Dockerでデータベースを起動

```bash
docker compose up -d
```

### 3. データベースの初期化

```bash
./db/setup.sh
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは http://localhost:3002 で起動します。

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
