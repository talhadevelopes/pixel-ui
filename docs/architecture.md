# Architecture

---

## Monorepo

The repository uses Turborepo with pnpm workspaces. `packages/types` defines all shared TypeScript types and is imported by both `apps/web` and `packages/server`, keeping the frontend and backend in sync on data shapes without duplication. `packages/ui` contains shared React components used by the frontend. `packages/eslint-config` and `packages/typescript-config` provide unified linting and compiler settings across all packages.

---

## Request Flow

The browser makes requests to the Next.js frontend. For data operations the frontend calls the Express backend directly via Axios. The backend validates the request, verifies the JWT, runs business logic through the service layer, queries the database via Prisma, and returns a response. The frontend updates its TanStack Query cache on success.

---

## AI Streaming Flow

When a user submits a prompt, the frontend sends the prompt and the full chat history to the backend. The backend opens a connection to OpenRouter with the Gemini model, requests a streaming response, and immediately establishes a Server-Sent Events connection back to the frontend. As OpenRouter returns chunks the backend forwards them to the frontend in real time. The frontend appends each chunk to the current code string and re-renders the iframe preview on each update. When the stream ends the backend saves the final code to the database and closes the SSE connection.

---

## Data Model

A User has many Projects. Each Project has many Frames. Each Frame has many Messages representing the chat history, and one current design which is the latest generated HTML. Frames also have Snapshots which are point-in-time copies of the design that can be restored. A Subscription belongs to one User and tracks the plan, status, daily credit limit, and current credit count.

---

## Security

Helmet sets secure HTTP response headers on every request. CORS restricts cross-origin requests to the configured client URL. HPP prevents HTTP parameter pollution attacks. JWT middleware verifies access tokens on all protected routes and rejects requests with invalid or expired tokens. bcryptjs hashes passwords before storage and compares hashes on login without storing or comparing plain text passwords at any point.