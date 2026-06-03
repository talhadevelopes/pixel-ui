# Frontend

The frontend is a Next.js 15 application inside `apps/web`. It handles UI generation, live preview rendering, visual element editing, image management, auth flows, and subscription management.

---

## Structure

```
apps/web/
├── app/
│   ├── (landing)/              # Landing page
│   ├── (pages)/
│   │   ├── workspace/          # Prompt input and project creation
│   │   ├── playground/         # AI generation and visual editor
│   │   └── payments/           # Subscription management
│   └── layout.tsx              # Root layout with providers
├── components/
│   ├── layout/                 # Sidebar, header
│   ├── auth/                   # Login and signup modals
│   └── global/                 # Providers, loaders
├── contexts/                   # AuthModalContext
├── hooks/                      # useAIGeneration and others
├── mutations/                  # TanStack Query mutations
├── queries/                    # TanStack Query queries
├── services/                   # API clients
├── store/                      # Zustand stores
└── lib/                        # Utilities and helpers
```

---

## Key Libraries

| Library | Purpose |
| :--- | :--- |
| Next.js 15 | App router, server components, routing |
| TanStack Query v5 | Server state, caching, mutations |
| Zustand | Local UI state for design store and website design store |
| Framer Motion | Animations |
| Radix UI | Accessible component primitives |
| react-syntax-highlighter | Code viewer with syntax highlighting |
| ImageKit | Image uploads, AI generation, and transforms |
| next-themes | Dark and light mode |
| Sonner | Toast notifications |

---

## State Management

TanStack Query handles all server state including project creation, frame loading, subscription status, and profile data. It provides caching, background refetching, and optimistic updates. Zustand manages local UI state that does not need to be synced with the server, specifically the design editor store which tracks selected elements, rendered code, undo and redo stacks, screen size selection, and settings panel visibility. The two libraries do not overlap.

---

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=

NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY=

NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm typecheck    # Run TypeScript type checking
```