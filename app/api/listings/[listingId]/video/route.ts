import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getVideoDetails(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    const videoDetails = await makeBackendRequest(
      `/api/listings/${listingId}/video`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error("[VIDEO_FETCH_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch video details",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(getVideoDetails);
  return authHandler(req, context);
}
