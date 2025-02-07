import { clerkMiddleware } from "@clerk/nextjs/server";

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
];

export default clerkMiddleware((auth, req) => {
  const isPublicPath = publicPaths.some((path) => req.url.includes(path));
  const isTrpcPath = req.url.includes("/api/trpc");
  const isWebhookPath = req.url.includes("/api/webhooks");

  // Allow public paths and webhook paths without authentication
  if (isPublicPath || isWebhookPath) {
    return;
  }

  // For TRPC paths, let the API handle authentication
  if (isTrpcPath) {
    return;
  }

  // Protect all other routes
  auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
};
