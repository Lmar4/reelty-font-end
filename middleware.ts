import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function middleware(request: NextRequest) {
  // Get the Firebase ID token from the Authorization header
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split("Bearer ")[1]
    : null;

  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    try {
      if (!token) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // Just verify the Firebase token - tRPC will handle admin authorization
      await getAuth().verifyIdToken(token);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/admin/:path*"],
};
