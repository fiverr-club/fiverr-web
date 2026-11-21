#!/usr/bin/env bash
set -euo pipefail

# Configures @reaction_news_bot profile photo, name, descriptions, commands, and webhook.
# Required env vars: REACTION_BOT_TOKEN
# Optional env vars: REACTION_WEBHOOK_SECRET, NEXT_PUBLIC_SITE_URL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOGO_PATH="${APP_DIR}/public/reaction-news-bot-logo.jpg"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://fiverrex.vercel.app}"
SITE_URL="${SITE_URL%/}"

if [ -z "${REACTION_BOT_TOKEN:-}" ]; then
  echo "Error: REACTION_BOT_TOKEN env var is required." >&2
  exit 1
fi

API_BASE="https://api.telegram.org/bot${REACTION_BOT_TOKEN}"

echo "1) Updating bot display name..."
curl -sS -X POST "${API_BASE}/setMyName" \
  -H "Content-Type: application/json" \
  -d '{"name":"Reaction News Bot"}'
echo ""

echo "2) Updating short description (About)..."
curl -sS -X POST "${API_BASE}/setMyShortDescription" \
  -H "Content-Type: application/json" \
  -d '{"short_description":"⚡ Dev Community Auto-Reaction & Tech News Pulse Bot — Big animated reactions (5–10/wave), polls & AI news!"}'
echo ""

echo "3) Updating full description..."
curl -sS -X POST "${API_BASE}/setMyDescription" \
  -H "Content-Type: application/json" \
  -d '{"description":"🔥 Reaction News Bot (@reaction_news_bot) — High-energy community engagement & Tech News Pulse engine for Dev Community & FIVERREX.\n\n⚡ Auto-drops big animated emoji reactions across 5–10 recent messages per wave\n🤝 Coordinates multi-bot distinct reactions across every community post & broadcast\n📰 /news — Fresh Gemini-powered AI & Tech News Pulses with 8-button reaction bars\n🔥 /hype 10 — Blast 10 reactions per bot across recent chat posts\n📊 /vibe — Interactive developer community polls"}'
echo ""

echo "4) Updating bot commands..."
curl -sS -X POST "${API_BASE}/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "hype", "description": "🔥 Blast 5-10 big reactions per bot across recent posts"},
      {"command": "react", "description": "⚡ Super-react wave on recent messages or replied post"},
      {"command": "news", "description": "📰 Publish a fresh AI/Tech News Pulse with reaction bar"},
      {"command": "vibe", "description": "📊 Launch an interactive developer community poll"},
      {"command": "status", "description": "🤖 Check reaction engine & coordinated bots status"},
      {"command": "help", "description": "📖 Show all commands & interaction features"}
    ]
  }'
echo ""

if [ -f "${LOGO_PATH}" ]; then
  echo "5) Updating bot profile photo from ${LOGO_PATH}..."
  curl -sS -X POST "${API_BASE}/setMyProfilePhoto" \
    -F 'photo={"type":"static","photo":"attach://avatar"}' \
    -F "avatar=@${LOGO_PATH};type=image/jpeg"
  echo ""
else
  echo "5) Warning: Logo not found at ${LOGO_PATH}, skipping profile photo upload."
fi

if [ -n "${REACTION_WEBHOOK_SECRET:-}" ]; then
  echo "6) Registering webhook at ${SITE_URL}/api/reaction-bot/webhook..."
  curl -sS -X POST "${API_BASE}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"url\": \"${SITE_URL}/api/reaction-bot/webhook\",
      \"secret_token\": \"${REACTION_WEBHOOK_SECRET}\",
      \"allowed_updates\": [\"message\", \"edited_message\", \"channel_post\", \"callback_query\", \"message_reaction\"],
      \"drop_pending_updates\": false
    }"
  echo ""
fi

echo "Done!"
