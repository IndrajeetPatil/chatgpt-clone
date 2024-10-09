# ChatGPT Clone

This is a clone of the [ChatGPT website](https://chat.openai.com/). It was built as an exercise to learn how to build a full-stack application using Django and Next.js.

## Features

- Chat with GPT-4

## Running locally

The docker-compose file is used to run the frontend and backend services. The frontend service is built using Next.js and the backend service is built using Django.

```bash
docker-compose up --build --force-recreate # if running for the first time
docker-compose up                          # if images already built
```

The frontend service is available at `http://localhost:3000` and the backend service is available at `http://localhost:8000`.

You only need to create `server/.env` file. You can copy the `server/.env.example` file and update the values.

## Quality Assurance

The frontend and backend services have their own quality checks (linters, formatters, static type checkers, OpenAPI schema validation, unit testing, code coverage).

These checks can be run using the following commands:

```bash
make qa
```

## Tech Stack

- Frontend: Next.js/TypeScript
- Backend: Django/Python

| Step            | Frontend      | Backend  |
| --------------- | ------------- | -------- |
| Package Manager | npm           | uv       |
| Bundler         | Turbopack     | -        |
| Formatter       | prettier      | ruff     |
| Linter          | eslint        | ruff     |
| Type checking   | Typescript    | mypy     |
| Unit testing    | jest          | pytest   |
| Code coverage   | jest          | coverage |
| API client      | axios         | openai   |
| API server      | -             | django   |
| Import sorter   | import-sorter | isort    |

## Grievances

- Using Django framework only for the API server seems like an overkill. fastAPI would have been a better choice.

- Using Next.js for the frontend is an overkill. A simple React app would have sufficed. But it was a good exercise to learn Next.js, especially server-side rendering, the distinction between client and server components, and the API routes.
