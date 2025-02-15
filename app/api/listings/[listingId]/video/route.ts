import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const GET = withAuth(async function GET(
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
});
