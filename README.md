# Reelty Frontend

A modern real estate management platform built with Next.js, TypeScript, and TailwindCSS.

## 🚀 Features

- Modern, responsive UI built with TailwindCSS and Radix UI
- Authentication with Firebase
- Real-time property management
- Interactive maps integration with Google Maps
- Subscription and billing management with Stripe
- Form handling with React Hook Form and Zod validation
- Dark/Light theme support
- Optimized for accessibility
- Real-time notifications and toasts
- File upload capabilities

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Radix UI, Shadcn
- **Authentication:** Clerk
- **State Management:** TanStack Query (React Query)
- **API Layer:** tRPC
- **Forms:** React Hook Form + Zod
- **Maps:** Google Maps API
- **Payment Processing:** Stripe
- **Analytics:** PostHog

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd reelty-front
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 🚀 Development

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

Run tests:

```bash
npm run test
# or
npm run test:watch
```

## 🏗️ Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## 📝 Scripts

- `dev` - Start development server
- `build` - Create production build
- `start` - Start production server
- `lint` - Run ESLint
- `test` - Run tests
- `test:watch` - Run tests in watch mode

## 🔒 Environment Variables

| Variable                             | Description            |
| ------------------------------------ | ---------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`       | Firebase API Key       |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`   | Firebase Auth Domain   |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`    | Firebase Project ID    |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`    | Google Maps API Key    |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |

## 📚 Project Structure

```
reelty-front/
├── app/                # Next.js app directory
├── components/         # Reusable components
│   ├── ui/            # UI components
│   ├── modals/        # Modal components
│   └── reelty/        # Business logic components
├── lib/               # Utility functions and configurations
├── public/            # Static assets
└── styles/            # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
