import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler functions
async function getListing(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    const data = await makeBackendRequest(`/api/listings/${listingId}`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listing",
      { status: 500 }
    );
  }
}

async function updateListing(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await req.json();

    const data = await makeBackendRequest(`/api/listings/${listingId}`, {
      method: "PATCH",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTING_PATCH_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update listing",
      { status: 500 }
    );
  }
}

async function deleteListing(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    await makeBackendRequest(`/api/listings/${listingId}`, {
      method: "DELETE",
      sessionToken: req.auth.sessionToken,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LISTING_DELETE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to delete listing",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(getListing);
  return authHandler(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(updateListing);
  return authHandler(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const authHandler = await withAuthServer(deleteListing);
  return authHandler(req, context);
}
