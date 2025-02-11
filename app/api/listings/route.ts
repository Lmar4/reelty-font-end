import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Listing } from "@/types/prisma-types";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const url = query ? `/api/listings?${query}` : "/api/listings";

    const listings = await makeBackendRequest<Listing[]>(url, {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("[LISTINGS_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listings",
      { status: 500 }
    );
  }
});

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  const body = await request.json();

  // Validate required fields
  if (!body.address) {
    return new NextResponse("Missing required field: address", { status: 400 });
  }

  try {
    const listing = await makeBackendRequest<Listing>("/api/listings", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: {
        ...body,
        userId: request.auth.userId,
        coordinates: body.coordinates
          ? {
              lat: Number(body.coordinates.lat),
              lng: Number(body.coordinates.lng),
            }
          : null,
        photoLimit: body.photoLimit || 10,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("[LISTINGS_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create listing",
      { status: 500 }
    );
  }
});
