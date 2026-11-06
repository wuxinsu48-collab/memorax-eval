#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
python_bin="$repo_dir/.venv/bin/python"
if [[ ! -x "$python_bin" ]]; then
  python_bin="python3"
fi
printf 'Building standalone leaderboard...\n'
VITE_STANDALONE_LEADERBOARD=true \
VITE_STATIC_SITE=true \
npm --prefix "$repo_dir/frontend" run build

printf 'Publishing generated assets through GitHub API...\n'
"$python_bin" "$repo_dir/scripts/publish_leaderboard_pages.py"
