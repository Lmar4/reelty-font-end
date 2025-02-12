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
    const token = await getToken();
    if (!token) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }

    try {
      // Fetch user data to check admin status
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();

      // Check if user has admin tier
      if (userData?.data?.currentTierId !== ADMIN_TIER_ID) {
        console.log("Unauthorized admin access attempt:", {
          userId,
          currentTier: userData?.data?.currentTierId,
        });
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
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
