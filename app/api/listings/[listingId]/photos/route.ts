import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return new NextResponse("No files provided", { status: 400 });
    }

    // Create a new FormData instance for the backend request
    const backendFormData = new FormData();
    files.forEach((file) => {
      backendFormData.append("files", file);
    });

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/listings/${params.listingId}/photos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
        body: backendFormData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new NextResponse(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTOS_UPLOAD]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
