# Pixel UI

Full-stack TypeScript monorepo for real-time AI UI generation and visual editing.

Most AI UI tools require a full design regeneration for every minor adjustment, which results in repeated prompting cycles. Pixel UI solves this by streaming responsive HTML and Tailwind CSS while providing a live preview that supports direct visual editing of element properties and classes. The platform includes an integrated image editor for swapping assets and applying AI transforms like background removal and upscaling through ImageKit. Work is managed within a Projects and Frames hierarchy where every design iteration is preserved as a restorable version snapshot.

| Frontend | Backend |
| :--- | :--- |
| Next.js 15 | Express 5 |
| React 19 | Node.js |
| TypeScript | TypeScript |
| Tailwind CSS | Prisma ORM |
| Radix UI | Neon serverless PostgreSQL |
| Framer Motion | JWT access and refresh tokens |
| next-themes | bcryptjs |
| TanStack Query v5 | Helmet |
| Zustand | CORS |
| react-syntax-highlighter | HPP |
| ImageKit | Razorpay |
| Google OAuth | Mailjet |
| | OpenRouter API |
| | Google Gemini |
| | Zod |
| | Jest |
| | Supertest |

## Quick Start

```bash
git clone https://github.com/talhadevelopes/pixel-ui.git
cd pixel-ui
pnpm install
# Configure .env files for apps/web and packages/server
pnpm dev
```

The frontend runs on localhost:3000 and the backend runs on localhost:4000.

## Documentation

- [docs/frontend.md](docs/frontend.md)
- [docs/backend.md](docs/backend.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/deployment.md](docs/deployment.md)

AGPL-3.0
