import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Photo } from "@/types/prisma-types";

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const order = formData.get("order");

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Forward the request to our backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (order) backendFormData.append("order", order.toString());

    const photo = await makeBackendRequest<Photo>(
      `/api/listings/${listingId}/photos`,
      {
        method: "POST",
        sessionToken: request.auth.sessionToken,
        body: backendFormData,
        // Let the browser handle the Content-Type header for FormData
      }
    );

    return NextResponse.json({ data: photo });
  } catch (error) {
    console.error("[PHOTO_UPLOAD_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to upload photo",
      { status: 500 }
    );
  }
});
