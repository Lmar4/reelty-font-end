import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    // Verify authentication
    const session = await auth();
    const token = await session.getToken();

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listingId } = await params;
    const body = await request.json();

    // Ensure we only send the s3Key for each photo
    if (body.photos && Array.isArray(body.photos)) {
      body.photos = body.photos.map((photo: { s3Key: string }) => ({
        s3Key: photo.s3Key,
      }));
    }

    // Forward the request to our backend
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL not configured");
    }

    const response = await fetch(
      `${backendUrl}/api/listings/${listingId}/process-photos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage =
            errorData.error || errorData.message || response.statusText;
        } else {
          errorMessage = await response.text();
        }
      } catch (parseError) {
        errorMessage = response.statusText;
      }

      throw new Error(`Backend error: ${errorMessage}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTO_PROCESSING_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to process photos",
      { status: 500 }
    );
  }
}
