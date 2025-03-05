import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler functions
async function getListingVideos(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    const data = await makeBackendRequest(`/api/listings/${listingId}/videos`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_VIDEOS_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listing videos",
      { status: 500 }
    );
  }
}

async function createListingVideo(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await req.json();

    const data = await makeBackendRequest(`/api/listings/${listingId}/videos`, {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_VIDEOS_POST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create listing video",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(getListingVideos);
  return authHandler(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(createListingVideo);
  return authHandler(req, context);
}
