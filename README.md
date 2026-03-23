# Pixel UI

AI-powered UI generation with real-time streaming and in-place visual editing.

**Live Demo:** [pixel-ui-web.vercel.app](https://pixel-ui-web.vercel.app)
---

## The Problem

Every AI UI tool on the market forces a full regeneration for every change. Adjust a color, wrong spacing, wrong font weight — back to the prompt. There is no visual control, no iterative editing, just repeated prompting cycles with no guarantee the rest of the design survives. Pixel UI solves this entirely.

---

## What Pixel UI Does

### Generation

Pixel UI streams responsive HTML and Tailwind CSS from a text prompt via OpenRouter and Google Gemini. The live iframe preview updates in real time as each chunk arrives over a Server-Sent Events connection — you watch the UI build itself, token by token, without waiting for a complete response.

### Visual Editor

Once generated, every element on the page is clickable. Select any element and edit its colors, spacing, typography, border radius, padding, margin, and custom Tailwind classes directly from a settings panel. No reprompting. No regeneration. The change is applied instantly and the preview reflects it immediately.

### Image Management

Images inside generated UIs can be swapped out without touching the prompt. Replace any image with an AI-generated alternative or a custom upload via ImageKit. Available transforms include smart crop, upscale, background removal, and drop shadow, all applied non-destructively.

### Export

Finished designs export as plain HTML or as a Next.js TSX page component. Both export formats open in a syntax-highlighted code viewer so the output is readable and copy-ready before download.

### Workspace

Work is organized into Projects and Frames. Each Frame maintains its own multi-turn chat history, so the AI has full context of every previous instruction when you continue a conversation. Frames are independent and can represent different pages, variants, or experiments within the same project.

### Version Control

Every Frame has a full undo and redo stack. Any previous version can be viewed in a diff view that highlights exactly what changed between two states. Snapshots capture a point-in-time copy of the design that can be restored at any time.

### Viewport Preview

The live preview renders across four viewport sizes: desktop, laptop, tablet, and mobile. Switch between them instantly to verify responsive behavior without leaving the editor.

### Authentication

Auth supports email and password registration with a 6-digit OTP verification flow via Mailjet, and Google OAuth via the standard authorization code flow. Both paths return a JWT access token and a refresh token. Access tokens are short-lived and refresh tokens silently issue new ones without requiring re-login.

### Subscriptions and Credits

Razorpay handles subscription payments. Each plan maps to a daily credit limit. Every AI generation consumes one credit. If the daily limit is reached the backend returns a 403 with the exact reset time. Credits reset daily. Subscription status and plan tier update automatically via Razorpay webhooks.

---

## Stack

| Frontend | Backend |
| :--- | :--- |
| Next.js 15 | Express 5 |
| React 19 | Node.js |
| TypeScript | TypeScript |
| Tailwind CSS | Prisma ORM |
| TanStack Query v5 | Neon PostgreSQL |
| Zustand | OpenRouter API |
| Framer Motion | Google Gemini |
| Radix UI | Razorpay |
| ImageKit | Mailjet |
| Google OAuth | JWT |
| next-themes | Zod |
| react-syntax-highlighter | bcryptjs |

---

## Quick Start

```bash
git clone https://github.com/talhadevelopes/pixel-ui.git
cd pixel-ui
pnpm install
```

Copy `.env.example` files inside `apps/web` and `packages/server`, fill in your credentials, then:

```bash
pnpm dev
```

Frontend runs on `localhost:3000`. Backend runs on `localhost:4000`.

---

## Documentation

- [Frontend](docs/frontend.md)
- [Backend](docs/backend.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)

---

## License

AGPL-3.0
