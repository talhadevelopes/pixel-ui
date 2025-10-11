# Pixel UI Frontend

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
- **AI-assisted playground** for generating responsive Tailwind UI layouts backed by Flowbite components.
- **Chat-driven workflow** that streams assistant responses into design code and persists it per frame.
- **Authenticated experience** with credential and Google OAuth flows backed by persisted tokens.
- **Design management** that saves generated HTML, user prompts, and configuration per project frame.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 with the App Router and React 19.
- **State & Data:** `@tanstack/react-query`, Zustand stores, and custom hooks under `apps/web/hooks/`.
- **UI:** `@workspace/ui` shared component library, Flowbite-inspired styles, `lucide-react` icons.
- **Tooling:** TypeScript, ESLint, Turborepo, Tailwind/PostCSS.

## 🚀 Quick Start
- **Install dependencies**
  ```bash
  pnpm install
  ```
- **Run the web app (from repo root)**
  ```bash
  pnpm dev --filter web
  ```
- **Open the UI** at `http://localhost:3000` (or the port configured via Next.js).

## 📁 Project Structure
```text
apps/web/
├─ app/                  # App Router routes and page components
│  ├─ (pages)/           # Nested route groups (e.g., `playground/[projectId]`)
│  └─ store/             # Client state stores (e.g., design store)
├─ components/           # Reusable UI components
├─ hooks/                # Custom React hooks (auth token, etc.)
├─ queries/              # React Query hooks for data fetching
├─ services/             # API clients (auth, projects, frames, chat)
├─ mutations/            # React Query mutations
├─ utils/                # Helpers such as streaming parsers
├─ public/               # Static assets
└─ package.json
```

## ⚙️ Configuration
- **Environment file:** create `apps/web/.env.local`.
- **Core variables:**
  - `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
  - `NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY`
  - `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
  - Any additional frontend-only flags required by integrations.
- **API base URL:** `apps/web/services/api.ts` defaults to `http://localhost:4000`. Update it or wire it to an env var when deploying.

## 📱 API Integration
- **Auth endpoints:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google-callback`, `GET /api/auth/profile`.
- **Project endpoints:** `POST /api/projects` to initialize a project + frame conversation.
- **Frame endpoints:** `GET/PUT /api/frames/:frameId` helpers for persisting generated code and messages.
- **Chat endpoints:** `POST /api/chat/completions` streams AI output, `POST /api/chat/messages` stores chat transcripts.
- API clients live in `apps/web/services/` and automatically attach authorization headers where required.

## 👨‍💻 Development
- **Type check:** `pnpm typecheck --filter web`
- **Lint & format:**
  ```bash
  pnpm lint --filter web
  pnpm lint:fix --filter web
  ```
- **Build:** `pnpm build --filter web`
- Frontend benefits from Turborepo caching; run commands from the repo root unless otherwise noted.

## 🤝 Contributing
- **Branching:** Create feature branches from `main`.
- **Coding style:** Follow the existing ESLint + Prettier configuration.
- **Testing changes:** Ensure linting and type checks pass before opening a PR.
- **Documentation:** Update this README when introducing new frontend capabilities or configuration.
