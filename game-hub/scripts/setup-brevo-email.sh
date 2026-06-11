#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

load_env_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    echo "Loading environment from $file"
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
  fi
}

load_env_file ".env"
load_env_file "supabase/functions/.env"

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: $name" >&2
    exit 1
  fi
}

require_var SUPABASE_ACCESS_TOKEN
require_var SUPABASE_PROJECT_REF
require_var BREVO_API_KEY
require_var BREVO_SENDER_EMAIL
require_var SEND_EMAIL_HOOK_SECRET

export SUPABASE_ACCESS_TOKEN

echo "Logging in to Supabase CLI..."
npx supabase login --token "$SUPABASE_ACCESS_TOKEN" --no-browser

echo "Linking project $SUPABASE_PROJECT_REF..."
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"

echo "Deploying send-auth-email function..."
npm run functions:deploy:email

echo "Setting Edge Function secrets..."
npx supabase secrets set "BREVO_API_KEY=$BREVO_API_KEY"
npx supabase secrets set "BREVO_SENDER_EMAIL=$BREVO_SENDER_EMAIL"
npx supabase secrets set "BREVO_SENDER_NAME=${BREVO_SENDER_NAME:-Gamer Stronghold}"
npx supabase secrets set "SEND_EMAIL_HOOK_SECRET=$SEND_EMAIL_HOOK_SECRET"

if [[ -n "${BREVO_RECOVERY_TEMPLATE_ID:-}" ]]; then
  npx supabase secrets set "BREVO_RECOVERY_TEMPLATE_ID=$BREVO_RECOVERY_TEMPLATE_ID"
fi

echo ""
echo "Brevo email setup complete."
echo "Next manual step: Supabase Dashboard → Authentication → Hooks → Send Email"
echo "  URL: https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/send-auth-email"
echo "  Secret: use the same value as SEND_EMAIL_HOOK_SECRET"
