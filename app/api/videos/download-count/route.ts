import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// GET /api/videos/download-count
// Gets the user's video download count

// Handler function
async function getDownloadCount(req: AuthenticatedRequest) {
  try {
    // Ensure we have a valid session token
    if (!req.auth.sessionToken) {
      console.error("[GET_DOWNLOAD_COUNT] No session token");
      return NextResponse.json(
        { success: false, error: "No session token" },
        { status: 401 }
      );
    }

    console.info("[GET_DOWNLOAD_COUNT] Fetching download count for user", {
      userId: req.auth.userId,
    });

    // Make request to backend to get the download count
    const data = await makeBackendRequest("/api/videos/download-count", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET_DOWNLOAD_COUNT_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get download count",
      },
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getDownloadCount);
  return authHandler(req);
}
