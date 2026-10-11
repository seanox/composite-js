#!/usr/bin/env bash
set -euo pipefail

ENGINE="${ENGINE:-blink}"
PORT="${PORT:-8000}"
TEST_DIR="${TEST_DIR:-/test}"
PLAYWRIGHT_DIR="${PLAYWRIGHT_DIR:-${TEST_DIR}/playwright}"

case "$ENGINE" in
  blink)
    BROWSER="chromium"
    ;;
  gecko)
    BROWSER="firefox"
    ;;
  webkit)
    BROWSER="webkit"
    ;;
  *)
    echo "Error: Engine not supported: '$ENGINE'."
    echo "supported: blink, gecko, webkit"
    exit 1
    ;;
esac

cd "$PLAYWRIGHT_DIR"
npm install
exec node runner.js -e "$ENGINE" -d "$TEST_DIR" -p "$PORT"
