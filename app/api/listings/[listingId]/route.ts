import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Listing } from "@/types/prisma-types";

export const GET = withAuth(async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    const listing = await makeBackendRequest<Listing>(
      `/api/listings/${listingId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(listing);
  } catch (error) {
    console.error("[LISTING_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listing",
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async function PATCH(
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

export const DELETE = withAuth(async function DELETE(
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
