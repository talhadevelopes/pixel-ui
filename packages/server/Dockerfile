FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files
COPY packages/server/package.json ./packages/server/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install ALL dependencies with shamefully-hoist to flatten everything
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source code
COPY packages/server ./packages/server
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config

# Set Prisma binary target for Alpine
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

# Generate Prisma Client with correct binary target
RUN cd packages/server && npx prisma generate

# Build
RUN pnpm --filter @workspace/types build
RUN pnpm --filter server build

FROM base AS runner
WORKDIR /app

# Copy everything from builder - dependencies are already flattened
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/package.json ./package.json
COPY --from=builder /app/packages/server/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=4000
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

EXPOSE 4000

CMD ["node", "dist/index.js"]