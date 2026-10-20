#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$repo_dir"

if ! command -v python3 >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  printf '请先安装 Python 3.11+ 和 Node.js 24.15+（含 npm）。\n' >&2
  exit 1
fi
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else "需要 Python 3.11+")'
node -e 'const [a,b]=process.versions.node.split(".").map(Number); if(a!==24 || b<15){console.error("需要 Node.js 24.15+");process.exit(1)}'

if [[ ! -x .venv/bin/python ]]; then
  python3 -m venv .venv
fi
dependency_file="requirements.lock"
if [[ ! -f "$dependency_file" ]]; then dependency_file="requirements.txt"; fi
dependency_hash="$(shasum -a 256 "$dependency_file" | awk '{print $1}')"
saved_hash=""
if [[ -f .venv/dependencies.sha256 ]]; then saved_hash="$(<.venv/dependencies.sha256)"; fi
if [[ "$dependency_hash" != "$saved_hash" ]]; then
  .venv/bin/python -m pip install -r "$dependency_file"
  printf '%s\n' "$dependency_hash" > .venv/dependencies.sha256
fi

frontend_hash="$(shasum -a 256 frontend/package-lock.json | awk '{print $1}')"
saved_frontend_hash=""
if [[ -f frontend/node_modules/.eval-dependencies.sha256 ]]; then
  saved_frontend_hash="$(<frontend/node_modules/.eval-dependencies.sha256)"
fi
if [[ "$frontend_hash" != "$saved_frontend_hash" ]]; then
  npm --prefix frontend ci --no-audit --no-fund
  printf '%s\n' "$frontend_hash" > frontend/node_modules/.eval-dependencies.sha256
fi
.venv/bin/python scripts/audit_longmem_readiness.py --strict >/dev/null
npm --prefix frontend run build
exec .venv/bin/python scripts/serve.py "$@"
