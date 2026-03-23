# Backend

The backend is an Express 5 API inside `packages/server`. It handles authentication, AI generation streaming, project and frame management, subscription payments, and email verification.

---

## Structure

```
packages/server/src/
├── controllers/    # Route handlers for each domain
├── middleware/     # JWT verification, request validation
├── routes/         # Express route definitions
├── services/       # Business logic, AI streaming, email, payments
├── utils/          # JWT helpers, database client
├── validation/     # Zod schemas for request validation
└── index.ts        # Express app entry point
```

---

## Auth Flow

Email and password registration sends a 6-digit OTP to the user via Mailjet. The user submits the OTP to verify their account and receives a JWT access token and refresh token on success. Google OAuth follows the standard authorization code flow — the backend exchanges the code for user info and returns the same JWT token pair. Access tokens are short-lived and refresh tokens issue new ones without requiring re-login. All protected routes verify the access token via middleware before processing the request.

---

## AI Generation Flow

The frontend sends a prompt and the full chat history to the backend. The backend forwards the request to OpenRouter with the Google Gemini model selected and immediately opens a Server-Sent Events connection back to the frontend. As OpenRouter streams response chunks, the backend pipes them to the frontend in real time. The frontend appends each chunk to the current code string and re-renders the iframe preview on every update. When the stream ends the backend saves the final code to the database and closes the SSE connection.

---

## Subscription and Credits

Each subscription plan maps to a daily credit limit. Every AI generation consumes one credit. The backend checks remaining credits before processing each generation request and returns a 403 with the exact reset time if the user is out of credits. Credits reset daily. Razorpay handles payment processing and webhooks update the user subscription status and plan tier in the database on successful payment.

---

## Environment Variables

```env
PORT=
NODE_ENV=
CLIENT_URL=

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

AI_API_KEY=

MAILJET_API_KEY=
MAILJET_API_SECRET=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PLAN_PRO=
RAZORPAY_PLAN_PREMIUM=
```

---

## Database

Prisma ORM with Neon serverless PostgreSQL. Schema lives in `packages/server/prisma/`.

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to database
pnpm db:studio     # Open Prisma Studio
```

---

## Scripts

```bash
pnpm dev           # Start with tsx watch
pnpm build         # Compile TypeScript
pnpm start         # Run compiled output
```