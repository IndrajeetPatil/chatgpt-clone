# Chatbot Template

A minimal full-stack chatbot template using React and FastAPI, backed by
Azure OpenAI GPT-4o and GPT-4o mini deployments.

## Architecture/Design

The project is structured as a monorepo with two services:

- `frontend`: A React application that allows users to interact with the
  configured Azure OpenAI model.
- `backend`: A FastAPI application that serves as the backend for the
  frontend application.

The frontend service is a Vite React application that uses the Vercel AI
SDK to manage chat state and streamed responses from the backend service.
The backend service is a FastAPI application that exposes a streaming
API backed by Azure OpenAI GPT-4o and GPT-4o mini deployments.

The UI is built with [Material
UI](https://mui.com/material-ui/getting-started/) components and follows
Google's Material Design.

## Setup

- Clone the repository
- Create `backend/.env` file (cf. `backend/.env.example`)
- Restore needed dependencies:

``` bash
# backend
cd backend
uv sync --frozen

# frontend
cd frontend
pnpm install --frozen-lockfile
```

- Run the services:

``` bash
docker-compose up
```

- The frontend service is available at `http://localhost:3000`
- The backend service is available at `http://localhost:8000`

REST API can be interactively explored using FastAPI's Swagger UI:
`http://localhost:8000/docs`

## Runtime Versions

| Runtime / tool | Version source | Current value |
|----------------|----------------|---------------|
| Python         | `backend/.python-version` / `backend/pyproject.toml` | 3.14 |
| uv             | `backend/pyproject.toml` / `backend/Dockerfile` | ≥ 0.11.2 locally, 0.11.8 in Docker |
| Node.js        | `frontend/.nvmrc` / frontend Docker image | 24 |
| pnpm           | `frontend/package.json` / CI workflows | 11.0.4 |

## Quality Assurance

### Automated checks

The frontend and backend services have their own quality checks.
All checks can be run locally with:

``` bash
make qa
```

To validate Lighthouse scores against thresholds locally:

``` bash
make lighthouse
```

To remove all build artifacts and tool caches for a clean slate (useful
for testing cold-cache behaviour):

``` bash
make clean
```

More specifically:

| Step                      | Frontend                         | Backend                   |
|---------------------------|----------------------------------|---------------------------|
| Package manager           | pnpm                             | uv                        |
| Formatter                 | Biome                            | Ruff                      |
| Linter                    | Biome                            | Ruff                      |
| Import sorter             | Biome                            | Ruff                      |
| Type checker              | TypeScript                       | ty                        |
| Type annotation coverage  | type-coverage                    | typecoverage              |
| Security linting          | ESLint (`react/no-unsanitized`)  | \-                        |
| Dead-code / complexity    | fallow                           | \-                        |
| CSS code quality          | @projectwallace/css-code-quality | \-                        |
| Markdown linting          | rumdl                            | rumdl                     |
| File naming               | ls-lint                          | ls-lint                   |
| Pre-commit hooks          | prek                             | prek                      |
| Commit message linting    | commitlint                       | commitlint                |
| IaC / workflow scan       | Checkov                          | Checkov                   |
| Unit testing              | Vitest                           | pytest                    |
| Code coverage             | Vitest                           | coverage.py               |
| Coverage floor            | 90% statements/functions/lines; 75% branches | 100% |
| Load testing              | \-                               | locust                    |
| End-to-end testing        | Playwright                       | \-                        |
| Dependency audit          | pnpm audit                       | uv audit                  |
| Performance / a11y        | Lighthouse CI                    | \-                        |
| API client                | Vercel AI SDK                    | openai                    |
| API server                | \-                               | FastAPI                   |
| UI toolkit                | Material UI                      | \-                        |
| Logger                    | \-                               | loguru                    |

Commit messages are validated by the `commit-msg` prek hook with commitlint.
The config follows conventional commits and accepts both lowercase and
uppercase commit types, for example `feat: ...` and `FEAT: ...`.

Checkov scans the repository's Dockerfiles, Docker Compose/YAML files,
GitHub Actions workflows, and secrets surface. Local-only secrets in
`backend/.env` are excluded because that file is required for development
and must not be committed:

``` bash
make security-scan
```

The Checkov scan also runs on every push and pull request through the
dedicated GitHub Actions security workflow. Commitlint is enforced locally
through the `commit-msg` prek hook.
