FROM node:18-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/package.json

RUN corepack enable && corepack prepare pnpm@8 --activate
RUN pnpm install --frozen-lockfile --filter server

COPY packages/server ./packages/server

WORKDIR /app/packages/server
RUN pnpm build

EXPOSE 4000
CMD ["node", "dist/index.js"]