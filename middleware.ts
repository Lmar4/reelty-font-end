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

// Cache for user tier checks (5 minutes)
const userTierCache = new Map<string, { tierId: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getUserTier(userId: string, token: string) {
  // Check cache first
  const cachedData = userTierCache.get(userId);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    return cachedData.tierId;
  }

  try {
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
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const userData = await response.json();
    const tierId = userData?.data?.currentTierId;

    // Update cache
    userTierCache.set(userId, { tierId, timestamp: now });

    return tierId;
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return null;
  }
}

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
      const tierId = await getUserTier(userId, token);

      // Check if user has admin tier
      if (tierId !== ADMIN_TIER_ID) {
        console.log("Unauthorized admin access attempt:", {
          userId,
          currentTier: tierId,
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
