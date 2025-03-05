import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler functions
async function getListings(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    let queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    const data = await makeBackendRequest(
      `/api/listings?${queryParams.toString()}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTINGS_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listings",
      { status: 500 }
    );
  }
}

async function createListing(req: AuthenticatedRequest) {
  try {
    const body = await req.json();

    const data = await makeBackendRequest("/api/listings", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTINGS_POST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create listing",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getListings);
  return authHandler(req);
}

export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(createListing);
  return authHandler(req);
}
