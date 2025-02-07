# Reelty Frontend

Modern real estate video generation platform built with Next.js 15.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Core Features

- AI-powered real estate video generation
- Property management dashboard
- Subscription tiers with Stripe integration
- Google Maps integration for property locations
- Dark/light theme support

## Tech Stack

- Next.js 15
- TypeScript
- TailwindCSS + Radix UI
- Clerk Authentication
- TanStack Query
- Stripe Payments
- Google Maps API
- PostHog Analytics

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Environment Variables

Required variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```

## Project Structure

```
├── app/                # Next.js app router pages
├── components/         # React components
├── lib/               # Utilities and config
├── public/            # Static assets
└── types/             # TypeScript types
```

## License

MIT
