import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/listings/${listingId}`,
      {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      return new NextResponse("Failed to fetch listing", {
        status: response.status,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/listings/${listingId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return new NextResponse("Failed to update listing", {
        status: response.status,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/listings/${listingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      }
    );

    if (!response.ok) {
      return new NextResponse("Failed to delete listing", {
        status: response.status,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LISTING_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
