#!/usr/bin/env bash
# Public-safety guard.
#
# Fails when the tracked tree contains internal infrastructure references,
# credential material, or credential-shaped assignments with a real value.
# Placeholders such as <from-secret-manager> and example-... are allowed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd -P)"
SCRIPT_PATH="${SCRIPT_DIR}/$(basename "${BASH_SOURCE[0]}")"
cd "${REPO_ROOT}"

SELF="${SCRIPT_PATH#"${REPO_ROOT}/"}"
STATUS=0

fail() {
  echo "[ERR] $1"
  STATUS=1
}

scan() { # scan <label> <regex> <pathspec...>
  local label="$1"
  local pattern="$2"
  shift 2

  local hits
  hits=$(git grep -nE "$pattern" -- "$@" 2>/dev/null | grep -v "^${SELF}:" || true)
  if [ -n "$hits" ]; then
    fail "${label}"
    echo "${hits}" | head -n 20
    echo
  fi
}

echo "[INFO] Scanning for internal infrastructure references..."
scan "internal host name or admin endpoint" \
  'home-srv|homesrv|dev-box|portainer\.529studio\.site|n8n\.529studio\.site|hub\.529studio\.site' \
  .

echo "[INFO] Scanning for credential material..."
scan "hardcoded credential material" \
  '(ghp|gho|ghs|ghu)_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}' \
  .

echo "[INFO] Scanning for credential-shaped assignments..."
# A real value is 24+ characters without a placeholder marker. The negative
# lookahead keeps <from-secret-manager>, example-..., and ${VAR} out of the gate.
scan "credential-shaped assignment with a real value" \
  '(SECRET|ACCESS_KEY|PRIVATE_KEY|TOKEN|PASSWORD|API_KEY|ACCOUNT_ID)[A-Z_]*=[A-Za-z0-9/+_-]{24,}' \
  .

if [ "${STATUS}" -ne 0 ]; then
  echo "[ERR] Public-safety guard failed. Remove the flagged values or load them from secrets/variables."
  exit 1
fi

echo "[OK] Public-safety guard passed."
