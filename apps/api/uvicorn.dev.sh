
set -euo pipefail
# activate venv
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
fi
exec python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
