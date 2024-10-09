# ChatGPT Clone

This is an elementary clone of the [ChatGPT website](https://chat.openai.com/).

## Requirements

The specified requirements were the following:

- Use Django as the backend and React as the frontend.
- Run the whole project in a Docker container.
- Allow users to select between GPT-4o and GPT-4o mini and change the temperature of the responses (0.2, 0.7, and 0.9).
- Request answers in Markdown format and display the answers in respect to the given format.
- Document functions, etc. via Docstrings.
- Pick one of the following:
  - Format the output in a way that's easy to differentiate between code and text.
  - Implement an example of function calling (live weather information, stock prices, etc.).
  - Add a way to copy the whole response or just the code of a response without having to select everything manually.
  - Give the possibility to regenerate a response.

## Running locally

The frontend service is built using Next.js and the backend service is built using Django. The docker-compose file is used to run the frontend and backend services.

You only need to create `server/.env` file (by copying the `server/.env.example` file and update the values) and then run the following command in the root directory:

```bash
docker-compose up
```

The frontend service is available at `http://localhost:3000` and the backend service is available at `http://localhost:8000`.

## Tech Stack

- Frontend: React/TypeScript
- Backend: Django/Python

| Step            | Frontend      | Backend  |
| --------------- | ------------- | -------- |
| Package Manager | npm           | uv       |
| Formatter       | prettier      | ruff     |
| Linter          | eslint        | ruff     |
| Type checking   | Typescript    | mypy     |
| Unit testing    | jest          | pytest   |
| Code coverage   | jest          | coverage |
| API client      | axios         | openai   |
| API server      | -             | django   |
| Import sorter   | import-sorter | isort    |
| Logger          | pino          | logging  |

## Quality Assurance

The frontend and backend services have their own quality checks (linters, formatters, static type checkers, OpenAPI schema validation, unit testing, code coverage).

Assuming you have the necessary tools locally installed, these checks can be run locally using the following commands:

```bash
make qa
```

## Grievances/Mistakes

- Using Django framework only for the API server seemed like an overkill. fastAPI would have been a better choice.

- Using Next.js only for the frontend was a total overkill. A vanilla React app would have sufficed. But it was a good exercise to learn Next.js, especially server-side rendering, the distinction between client and server components, and the API routes.
