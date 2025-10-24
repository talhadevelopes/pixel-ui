FROM node:18-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/

# Install all dependencies
RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app /app
COPY packages/server ./packages/server

RUN corepack enable && corepack prepare pnpm@8 --activate
WORKDIR /app/packages/server
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy the built dist and node_modules from packages/server
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=deps /app/packages/server/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]