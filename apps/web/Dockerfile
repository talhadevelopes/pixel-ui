FROM node:18-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

RUN corepack enable && corepack prepare pnpm@8 --activate
RUN pnpm install --frozen-lockfile --filter web

COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]