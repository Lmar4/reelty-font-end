import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { z } from "zod";

const MAX_BATCH_SIZE = 20; // Reasonable limit for batch processing

// Define validation schema for regeneration context
const regenerationContextSchema = z
  .object({
    existingPhotos: z
      .array(
        z.object({
          filePath: z.string().url(),
          id: z.string(),
          order: z.number(),
          processedFilePath: z.string().url(),
          runwayVideoPath: z.string().url().optional(),
        })
      )
      .optional(),
    photosToRegenerate: z
      .array(
        z.object({
          filePath: z.string().url(),
          id: z.string(),
          order: z.number(),
          processedFilePath: z.string().url().optional(),
        })
      )
      .optional(),
    regeneratedPhotoIds: z.array(z.string()).optional(),
    totalPhotos: z.number().optional(),
  })
  .optional();

// Define validation schema for the request body
const requestBodySchema = z.object({
  photoIds: z.array(z.string()).min(1).max(MAX_BATCH_SIZE),
  forceRegeneration: z.boolean().default(true),
  regenerationContext: regenerationContextSchema,
});

export const POST = withAuthServer(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = requestBodySchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "[PHOTOS_REGENERATE] Validation error:",
        validationResult.error
      );
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Invalid request format",
          details: validationResult.error.format(),
        }),
        { status: 400 }
      );
    }

    const { photoIds, forceRegeneration, regenerationContext } =
      validationResult.data;

    const response = await makeBackendRequest<{
      success: boolean;
      message: string;
      jobs?: Array<{ id: string; listingId: string }>;
      jobId?: string; // For backward compatibility
      listingId?: string; // For backward compatibility
      inaccessiblePhotoIds?: string[];
    }>("/api/photos/regenerate", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: {
        photoIds,
        forceRegeneration,
        isRegeneration: true,
        regenerationContext,
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
    if (!response.jobs) {
      // Check if we have legacy format with jobId and listingId
      if (response.jobId && response.listingId) {
        response.jobs = [
          {
            id: response.jobId,
            listingId: response.listingId,
          },
        ];
      } else if (response.success !== false) {
        console.error("[PHOTOS_REGENERATE] Invalid response format:", response);
        return NextResponse.json(
          {
            success: false,
            message: "Invalid response format from backend",
          },
          { status: 500 }
        );
      }
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
        jobs: response.jobs || [],
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
