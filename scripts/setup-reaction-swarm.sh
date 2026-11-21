#!/usr/bin/env bash
set -euo pipefail

# One-command onboarding for extra Telegram reaction swarm bots (to achieve 5-10 simultaneous
# native reactions on EVERY single message, since Telegram caps 1 reaction per bot per message).
#
# Usage:
#   ./scripts/setup-reaction-swarm.sh <TOKEN_2> <TOKEN_3> [<TOKEN_4> ... <TOKEN_10>]
#
# What it does:
# 1) Uploads the Reaction News Bot logo & sets short bio for each swarm bot
# 2) Saves all tokens into REACTION_SWARM_BOT_TOKENS on Vercel (huanchainrgp/fiverrex)
# 3) Triggers a production redeploy so every message instantly gets 5-10 distinct big reactions!

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <BOT_TOKEN_2> [BOT_TOKEN_3 ... BOT_TOKEN_10]" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOGO_PATH="${APP_DIR}/public/reaction-news-bot-logo.jpg"

JOINED_TOKENS=""
IDX=2
for TOKEN in "$@"; do
  CLEAN_TOKEN="$(printf '%s' "$TOKEN" | tr -d '[:space:]')"
  if [ -z "$CLEAN_TOKEN" ]; then
    continue
  fi

  API_BASE="https://api.telegram.org/bot${CLEAN_TOKEN}"
  echo "Configuring swarm bot #${IDX}..."
  curl -sS -X POST "${API_BASE}/setMyShortDescription" \
    -H "Content-Type: application/json" \
    -d '{"short_description":"⚡ Dev Community Auto-Reaction Swarm Bot — Powered by @reaction_news_bot"}' >/dev/null || true

  if [ -f "$LOGO_PATH" ]; then
    curl -sS -X POST "${API_BASE}/setMyProfilePhoto" \
      -F 'photo={"type":"static","photo":"attach://avatar"}' \
      -F "avatar=@${LOGO_PATH};type=image/jpeg" >/dev/null || true
  fi

  if [ -z "$JOINED_TOKENS" ]; then
    JOINED_TOKENS="$CLEAN_TOKEN"
  else
    JOINED_TOKENS="${JOINED_TOKENS},${CLEAN_TOKEN}"
  fi
  IDX=$((IDX + 1))
done

echo "Saving REACTION_SWARM_BOT_TOKENS to Vercel (huanchainrgp/fiverrex)..."
printf '%s' "$JOINED_TOKENS" | vercel env add REACTION_SWARM_BOT_TOKENS production,preview --sensitive --force --yes --project fiverrex --scope huanchainrgp

echo "Redeploying production..."
vercel deploy --prod --project fiverrex --scope huanchainrgp --yes

echo "Done! Make sure all swarm bots are added to your Telegram group."
