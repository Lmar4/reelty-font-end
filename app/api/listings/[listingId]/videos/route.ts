import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { logger } from "@/utils/logger";
import { NextResponse } from "next/server";

interface VideoResponse {
  success: boolean;
  data: {
    videos: {
      id: string;
      status: string;
      outputFile: string | null;
      thumbnailUrl: string | null;
      createdAt: string;
      metadata?: {
        templateResults?: Array<{
          template: string;
          status: "SUCCESS" | "FAILED";
          error?: string;
          timestamp: number;
          processingTime?: number;
        }>;
        mapVideo?: {
          path: string;
          coordinates: { lat: number; lng: number };
          generatedAt: string;
        };
      };
    }[];
    status: {
      isProcessing: boolean;
      processingCount: number;
      failedCount: number;
      completedCount: number;
      totalCount: number;
      shouldEndPolling?: boolean;
    };
  };
}

// GET /api/listings/[listingId]/videos
// Returns all videos for a listing, including status and metadata
export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    logger.info("[VIDEOS_GET] Fetching videos", {
      listingId,
      userId: req.auth.userId,
    });

    // Validate listingId
    if (!listingId || listingId === "undefined") {
      logger.error("[VIDEOS_GET] Invalid listingId", { listingId });
      return NextResponse.json(
        { success: false, error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    // Ensure we have a valid session token
    if (!req.auth.sessionToken) {
      logger.error("[VIDEOS_GET] No session token");
      return NextResponse.json(
        { success: false, error: "No session token" },
        { status: 401 }
      );
    }

    const response = await makeBackendRequest<VideoResponse>(
      `/api/listings/${listingId}/latest-videos`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    logger.info("[VIDEOS_GET] Raw response from backend:", response);

    // Ensure we have a valid response structure
    if (!response || typeof response !== "object") {
      logger.error("[VIDEOS_GET] Invalid response from backend:", { response });
      throw new Error("Invalid response from backend");
    }

    // Return the response directly without transformation
    return NextResponse.json(response);
  } catch (error) {
    logger.error("[VIDEOS_GET] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      listingId: (await params).listingId,
    });

    // Return a more detailed error response
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch videos",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
});

// POST /api/listings/[listingId]/videos
// Creates a new video generation job
export const POST = withAuthServer(async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await request.json();

    const data = await makeBackendRequest(`/api/listings/${listingId}/videos`, {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error("[VIDEOS_POST] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      listingId: (await params).listingId,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create video job",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
});
