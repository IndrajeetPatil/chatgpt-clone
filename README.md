# ChatGPT Clone

This is a clone of the [ChatGPT website](https://chat.openai.com/). It was built as an exercise to learn how to build a full-stack application using Django and Next.js.

## Features

- Chat with GPT-4

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
