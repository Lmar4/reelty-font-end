import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    if (!photoId) {
      return new NextResponse("Photo ID is required", { status: 400 });
    }

    const data = await makeBackendRequest(`/api/photos/${photoId}/status`, {
      method: "POST",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTO_STATUS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to check photo status",
      { status: 500 }
    );
  }
});
