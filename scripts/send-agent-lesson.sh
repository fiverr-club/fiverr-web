#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${APP_DIR}/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing ${ENV_FILE}" >&2
  exit 1
fi

AGENT_BROADCAST_SECRET=$(grep -E '^AGENT_BROADCAST_SECRET=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
SITE_URL=$(grep -E '^NEXT_PUBLIC_SITE_URL=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
SITE_URL="${SITE_URL:-https://fiverrex.vercel.app}"

if [ -z "${AGENT_BROADCAST_SECRET}" ]; then
  echo "AGENT_BROADCAST_SECRET missing in ${ENV_FILE}" >&2
  exit 1
fi

curl -sS -f -X POST "${SITE_URL%/}/api/agent-bot/broadcast" \
  -H "Authorization: Bearer ${AGENT_BROADCAST_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{}'
echo ""
