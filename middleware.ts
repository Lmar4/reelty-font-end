import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicPath = createRouteMatcher([
  "/",
  "/login",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
  "/pricing",
  "/api/webhooks(.*)",
  "/api/webhook(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const ADMIN_TIER_ID = "550e8400-e29b-41d4-a716-446655440003";

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken } = await auth();

  const isPublic = isPublicPath(req);
  const isAdmin = isAdminRoute(req);

  // Handle homepage redirect for authenticated users
  if (req.nextUrl.pathname === "/" && userId) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow public paths without authentication
  if (isPublic) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
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
        console.error("Failed to fetch user data:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });
        const responseText = await response.text();
        console.error("Response body:", responseText);
        throw new Error(
          `Failed to fetch user data: ${response.status} ${response.statusText}`
        );
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
      console.error("Error checking admin access:", {
        error,
        userId,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
        hasToken: !!token,
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
