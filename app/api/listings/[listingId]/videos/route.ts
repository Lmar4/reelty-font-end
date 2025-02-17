import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { logger } from "@/utils/logger";

interface VideoResponse {
  success: boolean;
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
}

// GET /api/listings/[listingId]/videos
// Returns all videos for a listing, including status and metadata
export const GET = withAuth(async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get("type"); // 'latest' or 'all'

    const endpoint =
      type === "latest"
        ? `/api/listings/${listingId}/latest-videos`
        : `/api/listings/${listingId}/videos`;

    const data = await makeBackendRequest<VideoResponse>(endpoint, {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error("[VIDEOS_GET]", {
      error: error instanceof Error ? error.message : "Unknown error",
      listingId: (await params).listingId,
    });

    if (error instanceof Error && error.message.includes("401")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch videos",
      { status: 500 }
    );
  }
});

// POST /api/listings/[listingId]/videos
// Creates a new video generation job
export const POST = withAuth(async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await request.json();

    const data = await makeBackendRequest(`/api/listings/${listingId}/videos`, {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error("[VIDEOS_POST]", {
      error: error instanceof Error ? error.message : "Unknown error",
      listingId: (await params).listingId,
    });

    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create video job",
      { status: 500 }
    );
  }
});
