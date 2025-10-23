FROM node:18-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY package.json pnpm-workspace.yaml ./

WORKDIR /app/apps/web
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./

WORKDIR /app/apps/web

EXPOSE 3000
CMD ["pnpm", "start"]