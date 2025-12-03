FROM node:18-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install --frozen-lockfile

COPY packages/server ./packages/server
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config

RUN cd packages/server && npx prisma generate
RUN pnpm --filter @workspace/types build
RUN pnpm --filter server build

FROM base AS runner
WORKDIR /app

# Install pnpm in runner
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma and generate
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma
RUN cd packages/server && npx prisma generate

# Copy built code
COPY --from=builder /app/packages/server/dist ./dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]