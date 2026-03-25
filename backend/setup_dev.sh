#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

if [ -x "$VENV_PYTHON" ]; then
  PYTHON_BIN="$VENV_PYTHON"
else
  PYTHON_BIN="python3"
fi

"$PYTHON_BIN" manage.py migrate
"$PYTHON_BIN" manage.py seed_admin
"$PYTHON_BIN" manage.py seed_menu
"$PYTHON_BIN" manage.py seed_orders
