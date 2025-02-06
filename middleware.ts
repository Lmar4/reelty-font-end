import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware, redirectToLogin } from "next-firebase-auth-edge";

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
  "/",
];

// Define the shape of our custom claims
interface CustomClaims {
  admin?: boolean;
}

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/auth/login",
    logoutPath: "/api/auth/logout",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: "AuthToken",
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_KEY || "default-key-at-least-32-chars-long",
    ],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 12 * 60 * 60 * 24, // 12 days
    },
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
    },
    // Enable features
    enableMultipleCookies: true,
    debug: process.env.NODE_ENV === "development",

    handleValidToken: async ({ token, decodedToken }, headers) => {
      // Authenticated users should not access public auth pages
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // For admin routes, check if user has admin claim
      if (request.nextUrl.pathname.startsWith("/admin")) {
        const claims = decodedToken.claims as CustomClaims;
        const isAdmin = claims?.admin === true;
        if (!isAdmin) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      // Pass modified headers to enable token verification caching
      return NextResponse.next({
        request: {
          headers,
        },
      });
    },

    handleInvalidToken: async (reason) => {
      console.info("Invalid token:", reason);

      // Don't redirect if accessing public paths
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
      }

      return redirectToLogin(request, {
        path: "/sign-in",
        publicPaths: PUBLIC_PATHS,
      });
    },

    handleError: async (error) => {
      console.error("Auth error:", error);
      return redirectToLogin(request, {
        path: "/sign-in",
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/api/auth/login",
    "/api/auth/logout",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/sign-in",
    "/sign-up",
    "/reset-password",
  ],
};
