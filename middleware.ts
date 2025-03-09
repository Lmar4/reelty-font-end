import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicPath = createRouteMatcher([
  "/login",
  "/sign-up",
  "/reset-password",
  "/recovery-password",
  "/pricing",
  "/terms",
  "/privacy",
  "/api/webhooks(.*)",
  "/api/webhook(.*)",
  "/api/storage/presigned-url", // Allow S3 presigned URL generation
  "/api/storage/upload", // Allow direct S3 uploads
  "/api/storage/migrate", // Allow migration of temporary files
]);

// Remove "/" from public paths to handle it separately
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Cache for user data checks (5 minutes)
const userTierCache = new Map<
  string,
  { tierId: string; role: string; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enhanced cache for admin role checks with longer TTL
const userRoleCache = new Map<string, { role: string; timestamp: number }>();
const ROLE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes for role cache

async function getUserData(userId: string, token: string) {
  // Check cache first
  const cachedData = userTierCache.get(userId);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    return cachedData;
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
    const role = userData?.data?.role;

    // Update cache with both tierId and role
    const userInfo = { tierId, role, timestamp: now };
    userTierCache.set(userId, userInfo);

    return userInfo;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Separate function to check admin role with optimized caching
async function checkAdminRole(
  userId: string,
  getToken: () => Promise<string | null>
) {
  // Check role cache first
  const cachedData = userRoleCache.get(userId);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < ROLE_CACHE_TTL) {
    return cachedData.role === "ADMIN";
  }

  // Get token only when needed
  const token = await getToken();
  if (!token) {
    return false;
  }

  try {
    const userData = await getUserData(userId, token);

    // Cache the role result
    if (userData?.role) {
      userRoleCache.set(userId, {
        role: userData.role,
        timestamp: now,
      });
    }

    return userData?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  // Special handling for homepage
  if (req.nextUrl.pathname === "/") {
    // Check if user is authenticated without redirecting yet
    const { userId } = await auth();

    // If authenticated, redirect to dashboard
    if (userId) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Otherwise allow access to homepage
    return NextResponse.next();
  }

  const isPublic = isPublicPath(req);
  const isAdmin = isAdminRoute(req);

  // Allow public paths without authentication
  if (isPublic) {
    return NextResponse.next();
  }

  // Now we can safely run auth for protected routes
  const { userId, getToken } = await auth();

  // Require authentication for all protected routes
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Handle admin routes with optimized token usage
  if (isAdmin) {
    const isAdmin = await checkAdminRole(userId, getToken);

    if (!isAdmin) {
      console.log("Unauthorized admin access attempt:", { userId });
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
