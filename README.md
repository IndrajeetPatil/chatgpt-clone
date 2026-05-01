# ChatGPT Clone


This is a minimal clone of the [ChatGPT
website](https://chat.openai.com/).

## Requirements

The specified requirements were the following:

- Use FastAPI as the backend and React as the frontend.
- Allow users to select between GPT-4o and GPT-4o mini and change the
  temperature of the responses (0.2, 0.7, and 0.9).
- Request answers in Markdown format and display the answers in respect
  to the given format.

## Implementation

![](demo.mov)

If the video is not accessible on GitHub README, have a look at it
[here](https://github.com/IndrajeetPatil/chatgpt-clone/blob/main/demo.mov).

## Architecture/Design

The project is structured as a monorepo with two services:

- `frontend`: A React application that allows users to interact with the
  GPT-4o model.
- `server`: A FastAPI application that serves as the backend for the
  frontend application.

The frontend service is a Vite React application that uses the Vercel AI
SDK to manage chat state and streamed responses from the backend service.
The backend service is a FastAPI application that exposes a streaming
API backed by Azure OpenAI GPT-4o deployments.

The UI is built with [Material
UI](https://mui.com/material-ui/getting-started/) components and follows
Google's Material Design.

## Setup

- Clone the repository
- Create `server/.env` file (cf. `server/.env.example`)
- Restore needed dependencies:

``` bash
# backend
cd server
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

| Step                  | Frontend                | Backend  |
|-----------------------|-------------------------|----------|
| Package Manager       | pnpm                    | uv       |
| Formatter             | biome                   | ruff     |
| Linter                | biome                   | ruff     |
| Type checking         | TypeScript              | ty       |
| Dead-code / complexity| fallow                  | \-       |
| CSS code quality      | @projectwallace/css-code-quality | \- |
| Unit testing          | vitest                  | pytest   |
| End-to-end test       | Playwright              | \-       |
| Code coverage         | vitest                  | coverage |
| Performance / a11y    | Lighthouse CI           | \-       |
| API client            | Vercel AI SDK           | openai   |
| API server            | \-                      | FastAPI  |
| Import sorter         | biome                   | ruff     |
| Logger                | \-                      | loguru   |

These checks are also run on every push to the repository using GitHub
Actions.

## Grievances/Mistakes

- Using Next.js only for the frontend was a total overkill. The frontend
  has since been migrated to a Vite React SPA, which is a better fit for
  this app.

## Room for Improvement

- Although this is PoC project that uses a monorepo approach to host the
  entire stack, the production-grade project should use separate
  repositories for the ease of development, maintenance, and deployment.

- The project could be improved by adding more features like user
  authentication and saving chat history.
