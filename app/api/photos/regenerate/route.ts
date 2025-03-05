import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { z } from "zod";
import { AuthenticatedRequest } from "@/utils/types";

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

// Handler function
async function regeneratePhoto(req: AuthenticatedRequest) {
  try {
    const body = await req.json();

    const data = await makeBackendRequest("/api/photos/regenerate", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTO_REGENERATE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to regenerate photo",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(regeneratePhoto);
  return authHandler(req);
}
