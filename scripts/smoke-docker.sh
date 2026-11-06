#!/usr/bin/env bash
# Docker smoke test for dynamic mode.
#
# Runs a real MCP server inside node:20-alpine with the same isolation profile
# used by src/sandbox/docker.js. The server reads /canary/host-file.txt, so a
# passing run proves the canary mount and the JSON-RPC path.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "${ROOT}"

if ! docker info >/dev/null 2>&1; then
  echo "[ERR] Docker daemon is not available."
  echo "      Start Docker Desktop or run: colima start"
  exit 1
fi

IMAGE="${MCP_SCAN_DOCKER_IMAGE:-node:20-alpine}"

if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
  echo "[INFO] Pulling ${IMAGE}..."
  docker pull "${IMAGE}" >/dev/null
fi

SCRIPT="$(cat scripts/docker-smoke-server.js)"
OUT="$(mktemp)"
trap 'rm -f "${OUT}"' EXIT

echo "[INFO] Running dynamic Docker scan..."
node src/cli.js \
  --stdio node \
  --arg -e \
  --arg "${SCRIPT}" \
  --dynamic \
  --sandbox docker \
  --sandbox-image "${IMAGE}" \
  --max-tools 1 \
  --timeout 15000 \
  --format json \
  --fail-on none >"${OUT}"

python3 - "${OUT}" <<'PY'
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
ids = {finding["id"] for finding in data["findings"]}

if "DYN-001" not in ids:
    print("[ERR] DYN-001 not found; findings:", sorted(ids))
    raise SystemExit(1)

print("[OK] Docker sandbox read the host canary and reported DYN-001.")
PY
