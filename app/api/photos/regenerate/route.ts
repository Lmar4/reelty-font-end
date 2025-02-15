import { NextResponse } from "next/server";
import {
  makeBackendRequest,
  withAuth,
  AuthenticatedRequest,
} from "@/utils/withAuth";

const MAX_BATCH_SIZE = 20; // Reasonable limit for batch processing

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const body = await request.json();
    const { photoIds } = body;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return new NextResponse("Invalid photo IDs", { status: 400 });
    }

    if (photoIds.length > MAX_BATCH_SIZE) {
      return new NextResponse(
        `Cannot process more than ${MAX_BATCH_SIZE} photos at once`,
        { status: 400 }
      );
    }

    const response = await makeBackendRequest<{
      success: boolean;
      message: string;
      jobs: Array<{ id: string; listingId: string }>;
      inaccessiblePhotoIds?: string[];
    }>("/api/photos/regenerate", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: { photoIds },
    });

    // Check if response has the expected structure
    if (!response || !Array.isArray(response.jobs)) {
      console.error(
        "[PHOTOS_REGENERATE] Invalid response structure:",
        response
      );
      throw new Error("Invalid response from backend");
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs: response.jobs,
        inaccessiblePhotoIds: response.inaccessiblePhotoIds || [],
        message: response.message || "Photos regeneration started successfully",
      },
    });
  } catch (error) {
    console.error("[PHOTOS_REGENERATE]", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Error",
      },
      { status: 500 }
    );
  }
});
