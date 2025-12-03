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

# Install dependencies (including Prisma)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/server ./packages/server
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config

# Generate Prisma Client
RUN cd packages/server && npx prisma generate

# Build types first, then server
RUN pnpm --filter @workspace/types build
RUN pnpm --filter server build

FROM base AS runner
WORKDIR /app

# Copy package files for production install
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json

# Install ONLY production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema and generate client in production
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma
RUN cd packages/server && npx prisma generate

# Copy built files
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "packages/server/dist/index.js"]