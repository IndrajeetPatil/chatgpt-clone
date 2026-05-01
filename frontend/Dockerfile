FROM node:24-bookworm-slim

# Activate the package manager declared in package.json (pnpm@11.0.3)
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build
EXPOSE 3000

CMD ["pnpm", "run", "start"]
