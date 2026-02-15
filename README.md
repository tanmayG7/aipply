# AiPply Frontend

Web application for AiPply, an AI-powered job application automation platform for the Indian job market. Users manage profiles, track applications, configure auto-apply preferences, and handle subscriptions.

## Tech Stack

- **Framework**: Next.js 15 (React 19, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI primitives, Framer Motion
- **Auth**: Firebase Authentication (email/password + Google OAuth)
- **Database**: Firebase Firestore (primary), MongoDB (job listings, server-side only)
- **Payments**: Razorpay (subscriptions + one-time payments)
- **State**: Redux Toolkit (user profile), React Context (onboarding forms)
- **Email**: Resend

## Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase project with Auth and Firestore enabled
- Razorpay account (for payment features)

## Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in `.env.local` with Firebase config, MongoDB URI, Razorpay keys, and other secrets. See [docs/firebase-setup.md](docs/firebase-setup.md) and [docs/razorpay-setup.md](docs/razorpay-setup.md).
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000

## Key Directories

```
app/                    # Next.js App Router pages and API routes
  api/                  # Server-side API routes (Razorpay webhooks, cron, subscriptions)
  dashboard/            # Protected dashboard pages (job board, tracker, profile, settings)
components/             # React components
  ui/                   # Shadcn/Radix base components
  subscription/         # Cancellation wizard, retention offers
  admin/                # Admin panel components
lib/                    # Shared utilities
  firebaseConfig/       # Firebase client SDK + CRUD operations
  store/, slices/       # Redux Toolkit state management
  security/             # Credential encryption (AES-256)
  types.ts              # TypeScript interfaces
  enhanced-skill-tree.ts # 700+ job title to skill mappings
hooks/                  # Custom React hooks
contexts/               # React Context providers (onboarding)
docs/                   # Project documentation
```

## Scripts

```bash
npm run dev              # Development server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Interactive Playwright test UI
npm run deploy           # Build + Firebase deploy
```

## Deployment

The frontend is deployed to Vercel (or Firebase Hosting). Environment variables must be set in the hosting platform's dashboard.

```bash
npm run build            # Verify build succeeds locally first
```

## Documentation

See the [docs/](docs/) folder for detailed guides on authentication, Firebase setup, Razorpay configuration, subscription flows, and more.
