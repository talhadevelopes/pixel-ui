FROM node:18-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile

COPY apps ./apps
COPY packages ./packages

# Build workspace packages first
RUN pnpm --filter @workspace/types build
RUN pnpm --filter @workspace/ui build

FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY package.json pnpm-workspace.yaml turbo.json ./

WORKDIR /app/apps/web
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./

WORKDIR /app/apps/web

EXPOSE 3000
CMD ["pnpm", "start"]