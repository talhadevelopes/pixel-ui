# Pixel UI Backend

## 📋 Table of Contents
- **[Features](#-features)**
- **[Tech Stack](#-tech-stack)**
- **[Quick Start](#-quick-start)**
- **[Project Structure](#-project-structure)**
- **[Configuration](#-configuration)**
- **[API Integration](#-api-integration)**
- **[Development](#-development)**
- **[Contributing](#-contributing)**

## ✨ Features
- **Authentication service** providing email/password registration, login, refresh tokens, and Google OAuth callbacks via `AuthController`.
- **Project orchestration** that persists project metadata, frame records, and chat transcripts using Drizzle ORM.
- **Chat streaming proxy** that relays requests to OpenRouter Gemini models and stores assistant responses.
- **Secure Express setup** with `helmet`, `hpp`, CORS, and JWT-based route guards for private APIs.

## 🛠️ Tech Stack
- **Runtime:** Node.js 20+ with Express 5.
- **Database:** PostgreSQL accessed through Drizzle ORM (`packages/server/src/db/schema.ts`).
- **Auth & Security:** `jsonwebtoken`, `bcryptjs`, custom middleware in `packages/server/src/middleware/auth.ts`.
- **Tooling:** TypeScript, `tsx` for dev runtime, Turborepo for orchestration.

## 🚀 Quick Start
- **Install dependencies** (from repo root)
  ```bash
  pnpm install
  ```
- **Run the backend** (from repo root)
  ```bash
  pnpm dev --filter server
  ```
- Server defaults to `http://localhost:4000`. Health check: `GET /health`.
- **Build for production**
  ```bash
  pnpm build --filter server
  pnpm start --filter server
  ```

## 📁 Project Structure
```text
packages/server/
├─ src/
│  ├─ controllers/       # Express controllers (auth, chat, frame, project)
│  ├─ routes/            # Route definitions mounted in `src/index.ts`
│  ├─ middleware/        # JWT auth guard and request helpers
│  ├─ db/                # Drizzle schema definitions
│  ├─ services/          # External integrations (Google OAuth, etc.)
│  ├─ utils/             # Utility helpers (JWT, database client)
│  └─ validation/        # Zod schemas for request payloads
├─ drizzle.config.ts     # Drizzle CLI configuration
├─ package.json
└─ tsconfig.json
```

## ⚙️ Configuration
Create `packages/server/.env` (see example stub). Required keys:
- `PORT` (default `4000`).
- `CLIENT_URL` (frontend origin for CORS + OAuth redirect).
- `DATABASE_URL` (PostgreSQL connection string used in Drizzle config).
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` for signing tokens.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth.
- `OPENROUTER_API_KEY` to access Gemini models.

Optional helpers:
- `NODE_ENV` for environment-specific toggles.
- Additional service credentials as needed by future integrations.

Run `pnpm db:generate --filter server` to sync Drizzle types after schema updates; `pnpm db:push --filter server` to apply migrations.

## 📱 API Integration
- **Auth routes (`/api/auth`):** register, login, refresh token, Google OAuth, and profile retrieval (`AuthController`).
- **Project routes (`/api/projects`):** create new project + frame records (`ProjectController`).
- **Frame routes (`/api/frames`):** fetch and update frame design + chat history (`FrameController`).
- **Chat routes (`/api/chat`):** stream AI completions and update stored chat messages (`ChatController`).

Responses follow the helper format in `packages/server/src/types/response.ts`, returning `data`, `message`, and appropriate status codes.

## 👨‍💻 Development
- **Type check:** `pnpm typecheck --filter server`
- **Lint:** configure linting via root ESLint (inherit from workspace config).
- **Database utilities:** use Drizzle CLI commands (`db:generate`, `db:push`, `db:studio`).
- **Testing:** Add tests under `packages/server/src/__tests__/` and wire a script when ready.

## 🤝 Contributing
- **Branching:** Branch from `main` and open PRs with descriptive summaries.
- **Code style:** Follow workspace TypeScript + ESLint conventions.
- **Security:** Never commit real secrets; use `.env` placeholders.
- **Docs:** Update this README when altering API contracts, env variables, or infrastructure.
