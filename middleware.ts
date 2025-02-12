import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicPath = createRouteMatcher([
  "/login",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Admin tier ID constant
const ADMIN_TIER_ID = "550e8400-e29b-41d4-a716-446655440003";

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken } = await auth();
  const isPublic = isPublicPath(req);
  const isAdmin = isAdminRoute(req);
  const isWebhookPath = req.url.includes("/api/webhooks");
  const isWebhookStripe = req.url.includes("/api/webhook");
  const isHomePage = req.nextUrl.pathname === "/";

  // Handle homepage redirect for authenticated users
  if (isHomePage && userId) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow public paths and webhook paths without authentication
  if (isPublic || isWebhookPath || isHomePage || isWebhookStripe) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnTo", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Handle admin routes
  if (isAdmin) {
    console.log("[MIDDLEWARE] Processing admin route access for URL:", req.url);
    try {
      const sessionToken = await getToken();
      console.log("[MIDDLEWARE] Session token exists:", !!sessionToken);

      if (!sessionToken) {
        console.log("[MIDDLEWARE] No session token found, redirecting to home");
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      const apiUrl = `${process.env.BACKEND_URL}/api/users/${userId}`;
      console.log("[MIDDLEWARE] Fetching user data from:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[MIDDLEWARE] User data response status:", response.status);

      if (!response.ok) {
        console.log(
          "[MIDDLEWARE] Failed to fetch user data:",
          await response.text()
        );
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      const responseData = await response.json();
      console.log(
        "[MIDDLEWARE] User data response:",
        JSON.stringify(responseData, null, 2)
      );

      const { data: user } = responseData;
      console.log("[MIDDLEWARE] Admin check:", {
        currentTierId: user?.currentTierId,
        requiredTierId: ADMIN_TIER_ID,
        isAdmin: user?.currentTierId === ADMIN_TIER_ID,
      });

      if (user?.currentTierId !== ADMIN_TIER_ID) {
        console.log("[MIDDLEWARE] User is not admin, redirecting to home");
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      console.log("[MIDDLEWARE] Admin access granted");
    } catch (error) {
      console.error("[MIDDLEWARE] Admin auth error:", {
        name: error instanceof Error ? error.name : "Unknown Error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
});

// Specify which routes the middleware should run on
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
