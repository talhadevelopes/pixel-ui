FROM node:18-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files first
COPY packages/server/package.json ./packages/server/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/server ./packages/server
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config

# Build
RUN pnpm --filter server build

FROM base AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]