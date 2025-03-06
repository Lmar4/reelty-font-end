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
  "/terms",
  "/privacy",
  "/api/webhooks(.*)",
  "/api/webhook(.*)",
  "/api/storage/presigned-url", // Allow S3 presigned URL generation
  "/api/storage/upload", // Allow direct S3 uploads
  "/api/storage/migrate", // Allow migration of temporary files
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Cache for user data checks (5 minutes)
const userTierCache = new Map<
  string,
  { tierId: string; role: string; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

export default clerkMiddleware(async (auth, req) => {
  const isPublic = isPublicPath(req);
  const isAdmin = isAdminRoute(req);

  // Don't run auth for public paths
  if (isPublic) {
    return NextResponse.next();
  }

  // Now we can safely run auth
  const { userId, getToken } = await auth();

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
      const userData = await getUserData(userId, token);

      // Check if user has admin role
      if (userData?.role !== "ADMIN") {
        console.log("Unauthorized admin access attempt:", {
          userId,
          role: userData?.role,
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
