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
    const { photoIds, forceRegeneration = true } = body;

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
      body: {
        photoIds,
        forceRegeneration,
        isRegeneration: true,
      },
    });

    // If we get undefined response but no error was thrown, it likely means
    // the backend is still processing but hasn't responded in time
    if (!response) {
      console.warn(
        "[PHOTOS_REGENERATE] Backend request timeout - job may still be processing"
      );
      return NextResponse.json(
        {
          success: true,
          message:
            "Request accepted. Photo regeneration may take longer than expected.",
          data: {
            jobs: [], // We don't have job IDs in this case
            inaccessiblePhotoIds: [],
            message:
              "Photo regeneration started but taking longer than expected. Please check status later.",
          },
        },
        { status: 202 } // Accepted status code
      );
    }

    // Handle case where response exists but jobs array is missing
    if (!response.jobs && response.success !== false) {
      console.error(
        "[PHOTOS_REGENERATE] Response missing jobs array:",
        response
      );

      // If we have an error message from backend, use it
      if (response.message) {
        return NextResponse.json(
          {
            success: false,
            message: response.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Invalid response format from backend",
        },
        { status: 500 }
      );
    }

    // If the response indicates failure but has a message, return that
    if (response.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: response.message || "Failed to regenerate photos",
          inaccessiblePhotoIds: response.inaccessiblePhotoIds,
        },
        { status: response.inaccessiblePhotoIds ? 404 : 500 }
      );
    }

    // Success case
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

    // Determine appropriate status code based on error
    const statusCode =
      error instanceof Error && error.message.includes("No response received")
        ? 503 // Service Unavailable
        : 500; // Internal Server Error

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process photo regeneration request",
      },
      { status: statusCode }
    );
  }
});
