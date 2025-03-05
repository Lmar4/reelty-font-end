import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// POST /api/videos/track-download
// Tracks a video download in the database

// Handler function
async function trackVideoDownload(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { jobId, templateKey, userId } = body;

    // Validate required fields
    if (!jobId || !templateKey) {
      console.error("[TRACK_DOWNLOAD] Missing required fields", { body });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure we have a valid session token
    if (!req.auth.sessionToken) {
      console.error("[TRACK_DOWNLOAD] No session token");
      return NextResponse.json(
        { success: false, error: "No session token" },
        { status: 401 }
      );
    }

    console.info("[TRACK_DOWNLOAD] Tracking download", {
      jobId,
      templateKey,
      userId: userId || req.auth.userId,
    });

    // Make request to backend to track the download
    const data = await makeBackendRequest("/api/videos/track-download", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[TRACK_DOWNLOAD_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to track video download",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(trackVideoDownload);
  return authHandler(req);
}
