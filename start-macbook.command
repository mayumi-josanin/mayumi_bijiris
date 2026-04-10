#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "Mayumi Bijiris を起動します。"
echo "このウィンドウを閉じるとアプリは停止します。"
echo

npm start
