import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { logger } from "@/utils/logger";
import { NextResponse } from "next/server";

// POST /api/videos/track-download
// Tracks a video download in the database
export const POST = withAuthServer(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const body = await request.json();
    const { jobId, templateKey, userId } = body;

    // Validate required fields
    if (!jobId || !templateKey) {
      logger.error("[TRACK_DOWNLOAD] Missing required fields", { body });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure we have a valid session token
    if (!request.auth.sessionToken) {
      logger.error("[TRACK_DOWNLOAD] No session token");
      return NextResponse.json(
        { success: false, error: "No session token" },
        { status: 401 }
      );
    }

    logger.info("[TRACK_DOWNLOAD] Tracking download", {
      jobId,
      templateKey,
      userId: userId || request.auth.userId,
    });

    // Make request to backend to track the download
    const data = await makeBackendRequest(`/api/videos/track-download`, {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: {
        jobId,
        templateKey,
        userId: userId || request.auth.userId,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error("[TRACK_DOWNLOAD] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to track download",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
});
