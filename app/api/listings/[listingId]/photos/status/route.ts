import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface PhotoStatus {
  processingCount: number;
  failedCount: number;
  totalCount: number;
}

// Handler function
async function getPhotoStatus(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    const data = await makeBackendRequest(
      `/api/listings/${listingId}/photos/status`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTO_STATUS_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch photo status",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(getPhotoStatus);
  return authHandler(req, context);
}
