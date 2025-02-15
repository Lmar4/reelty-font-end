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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const order = formData.get("order");

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Forward the request to our backend
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL not configured");
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (order) backendFormData.append("order", order.toString());

    const response = await fetch(
      `${backendUrl}/api/listings/${listingId}/photos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      }
    );

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${errorText || response.statusText}`);
    }

    // Only try to parse JSON if the response is JSON
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json({ data: data.data });
    }

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("[PHOTO_UPLOAD_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to upload photo",
      { status: 500 }
    );
  }
}
