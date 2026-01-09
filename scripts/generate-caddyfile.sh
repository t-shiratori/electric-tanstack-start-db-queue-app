#!/bin/bash
# .envファイルからCaddyfileを生成するスクリプト

set -e

# .envファイルを読み込み
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# デフォルト値を設定（.envファイルで上書きされることを想定）
VITE_LOCAL_IP_ADDRESS=${VITE_LOCAL_IP_ADDRESS:-192.168.x.x}
VITE_LOCAL_HOSTNAME=${VITE_LOCAL_HOSTNAME:-queue-app.localhost}
VITE_DEV_PORT=${VITE_DEV_PORT:-5173}

# テンプレートから環境変数を展開してCaddyfileを生成
envsubst < Caddyfile.template > Caddyfile

echo "✅ Caddyfile generated from template"
echo "   VITE_LOCAL_HOSTNAME: $VITE_LOCAL_HOSTNAME"
echo "   VITE_LOCAL_IP_ADDRESS: $VITE_LOCAL_IP_ADDRESS"
echo "   VITE_DEV_PORT: $VITE_DEV_PORT"
