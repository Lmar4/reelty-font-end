import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getPhotoStatus(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    const data = await makeBackendRequest(`/api/photos/${photoId}/status`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTO_STATUS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch photo status",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const authHandler = await withAuthServer(getPhotoStatus);
  return authHandler(req, context);
}
