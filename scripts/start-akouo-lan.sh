#!/usr/bin/env zsh

# start-akouo-lan.sh
# Starts the Akoúō app for LAN access (any device on your network).
#
# Usage:
#   ./scripts/start-akouo-lan.sh          # start the Akoúō app
#   BENCH_API=http://<host>:<port> ./scripts/start-akouo-lan.sh   # also point the
#                                          # app's Benchmark panel at a running API
#
# NOTE (Sonic Evolution, 2026-07): the standalone benchmark API that used to live
# in a sibling `bench/` folder has been retired. The benchmark suites, scores and
# dashboard now live in the **algophony** repo (algophony/benchmark + algophony/studio).
# Run algophony's dashboard separately and export its URL as BENCH_API to wire the
# Akoúō app's Benchmark panel to it.

set -e

SCRIPT_DIR="${0:A:h}"
AKOUO_ROOT="${SCRIPT_DIR:h}"      # parent of scripts/ = repo root
APP_DIR="$AKOUO_ROOT/app"
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "unknown")

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Akoúō LAN Launcher                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "LAN IP detected: $LAN_IP"
[ -n "$BENCH_API" ] && echo "Benchmark API:   $BENCH_API (from algophony)" || echo "Benchmark API:   (none — set BENCH_API to wire the Benchmark panel; see algophony repo)"
echo ""

cleanup() {
  echo ""
  echo "→ Stopping services..."
  [ -n "$APP_PID" ] && kill $APP_PID 2>/dev/null
  exit 0
}
trap cleanup EXIT INT TERM

start_app() {
  echo "→ Starting Akoúō app..."
  cd "$APP_DIR"
  VITE_AKOUO_BENCHMARK_API="${BENCH_API:-}" npx vite --host 0.0.0.0 --port 5173 &
  APP_PID=$!
  echo "  App PID: $APP_PID"
  echo "  URL: http://$LAN_IP:5173"
  echo ""
}

start_app

echo "──────────────────────────────────────────────────────────────"
echo "Akoúō app running. Access from any device on your network:"
echo ""
echo "  Akoúō App:  http://$LAN_IP:5173"
echo ""
echo "Press Ctrl+C to stop."
echo "──────────────────────────────────────────────────────────────"

wait
