# Reelty Frontend

A modern real estate video generation platform built with Next.js 15, designed to help real estate professionals create engaging property videos with AI.

## Features

### Core Functionality
- AI-powered real estate video generation
- Intuitive property management dashboard
- Smart address lookup with Google Maps integration
- Drag-and-drop photo management
- Custom video templates and configurations

### User Experience
- Responsive design with dark/light theme support
- Real-time video generation progress
- Interactive property management
- Seamless file uploads

### Business Features
- Flexible subscription plans with Stripe integration
- Credit-based usage system
- Detailed analytics and usage tracking
- Email notifications for key events

## Tech Stack

### Frontend
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** 
  - Radix UI primitives
  - Shadcn/ui components
  - Custom reusable components

### Authentication & Payments
- **Auth:** Clerk Authentication
- **Payments:** Stripe Integration
- **Analytics:** PostHog

### APIs & Integration
- **State Management:** TanStack Query
- **Maps:** Google Maps API
- **Email:** React Email

## Getting Started

1. Clone and install dependencies:
```bash
git clone <repository-url>
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Required variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```

3. Start development server:
```bash
pnpm dev
```

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (marketing)/       # Public marketing pages
│   ├── (users)/           # Protected user routes
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── modals/           # Modal dialogs
│   └── reelty/           # Feature-specific components
├── emails/                # Email templates
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── schemas/               # Zod validation schemas
└── types/                # TypeScript types
```

## Development Commands

```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## License

MIT
