import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { makeBackendRequest } from "@/utils/withAuth";

const MAX_BATCH_SIZE = 20; // Reasonable limit for batch processing

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
      data: {
        jobs: Array<{ id: string; listingId: string }>;
      };
    }>("/api/photos/regenerate", {
      method: "POST",
      body: { photoIds },
    });

    return NextResponse.json({
      success: true,
      data: {
        jobs: response.data.jobs,
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
}
