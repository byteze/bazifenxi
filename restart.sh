#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PM2_APP="${PM2_APP:-bazifenxi}"
SERVICE_NAME="${SERVICE_NAME:-bazifenxi}"
MODE="${1:-auto}"
PORT_ENV="${PORT:-}"

log() {
  printf "[restart] %s\n" "$1"
}

# Build the Vite project first
log "npm run build"
cd "$APP_DIR"
npm run build

restart_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    return 1
  fi
  if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
    log "pm2 restart $PM2_APP"
    pm2 restart "$PM2_APP"
  else
    log "pm2 start server.js as $PM2_APP"
    if [ -n "$PORT_ENV" ]; then
      PORT="$PORT_ENV" pm2 start "$APP_DIR/server.js" --name "$PM2_APP"
    else
      pm2 start "$APP_DIR/server.js" --name "$PM2_APP"
    fi
  fi
}

restart_systemd() {
  if ! command -v systemctl >/dev/null 2>&1; then
    return 1
  fi
  if systemctl list-unit-files | grep -q "^${SERVICE_NAME}\.service"; then
    log "systemctl restart $SERVICE_NAME"
    sudo systemctl restart "$SERVICE_NAME"
  else
    return 1
  fi
}

restart_node() {
  mkdir -p "$APP_DIR/logs"
  if pgrep -f "$APP_DIR/server.js" >/dev/null 2>&1; then
    log "stop node server.js"
    pkill -f "$APP_DIR/server.js" || true
    sleep 1
  fi
  log "start node server.js"
  if [ -n "$PORT_ENV" ]; then
    nohup env PORT="$PORT_ENV" node "$APP_DIR/server.js" > "$APP_DIR/logs/server.log" 2>&1 &
  else
    nohup node "$APP_DIR/server.js" > "$APP_DIR/logs/server.log" 2>&1 &
  fi
}

case "$MODE" in
  pm2)
    restart_pm2 || { log "pm2 not available"; exit 1; }
    ;;
  systemd)
    restart_systemd || { log "systemd service not found"; exit 1; }
    ;;
  node)
    restart_node
    ;;
  auto)
    if restart_pm2; then
      exit 0
    fi
    if restart_systemd; then
      exit 0
    fi
    restart_node
    ;;
  *)
    echo "Usage: $0 [auto|pm2|systemd|node]" >&2
    exit 1
    ;;
esac
