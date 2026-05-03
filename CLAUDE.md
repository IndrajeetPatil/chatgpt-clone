# Agents

Minimal full-stack chatbot: React frontend + FastAPI backend,
streamed via Azure OpenAI GPT-4o.

## Architecture

```text
frontend/   React + Vite + Vercel AI SDK + Material UI
server/     FastAPI + openai + loguru
```

## Setup

```bash
# Backend
cd server && uv sync --frozen

# Frontend
cd frontend && pnpm install --frozen-lockfile
```

Requires `server/.env` (see `server/.env.example`).

## Commands

```bash
make qa              # full quality suite (format, lint, type-check, test, coverage)
make test            # unit tests only
make format          # auto-format all code
make lint            # lint all code
make type-check      # static type checking
make run             # start both servers locally
docker-compose up    # run via Docker
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## Constraints

- Backend test coverage must stay ≥ 95%; frontend at 100%.
- Type annotation coverage must be 100% on both sides.
- File names must pass `ls-lint` (`make file-naming`).
- Pre-commit hooks enforced via `prek` — run `make hooks` to check all files.
- Always run `make qa` before committing.
