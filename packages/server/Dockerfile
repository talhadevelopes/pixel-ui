FROM node:18-alpine AS deps
WORKDIR /app/packages/server

RUN corepack enable && corepack prepare pnpm@8 --activate

# Copy only server package files
COPY packages/server/package.json ./
COPY packages/server/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app/packages/server

COPY packages/server .
RUN corepack enable && corepack prepare pnpm@8 --activate
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy built files and the correct node_modules
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=deps /app/packages/server/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]