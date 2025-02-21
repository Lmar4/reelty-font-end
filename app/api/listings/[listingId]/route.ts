import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Listing } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;

  try {
    if (!listingId) {
      return new NextResponse("Listing ID is required", { status: 400 });
    }

    const data = await makeBackendRequest(`/api/listings/${listingId}`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    if (!data) {
      return new NextResponse("Listing not found", { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_API_ERROR]", {
      error: error instanceof Error ? error.message : "Unknown error",
      listingId,
    });

    if (error instanceof Error && error.message.includes("401")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listing",
      { status: 500 }
    );
  }
});

export const PATCH = withAuthServer(async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await request.json();

    const listing = await makeBackendRequest<Listing>(
      `/api/listings/${listingId}`,
      {
        method: "PATCH",
        sessionToken: request.auth.sessionToken,
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json(listing);
  } catch (error) {
    console.error("[LISTING_PATCH]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update listing",
      { status: 500 }
    );
  }
});

export const DELETE = withAuthServer(async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    await makeBackendRequest(`/api/listings/${listingId}`, {
      method: "DELETE",
      sessionToken: request.auth.sessionToken,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LISTING_DELETE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to delete listing",
      { status: 500 }
    );
  }
});
