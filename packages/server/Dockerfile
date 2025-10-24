FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/packages/server
RUN pnpm build

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Run
CMD ["node", "dist/index.js"]