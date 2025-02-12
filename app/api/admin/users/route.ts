import { NextResponse } from "next/server";
import { withAuth, makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuth(async (request) => {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const minCredits = searchParams.get("minCredits");
    const maxCredits = searchParams.get("maxCredits");
    const search = searchParams.get("search");

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (tier) {
      queryParams.set("tier", tier);
    }
    if (status) {
      queryParams.set("status", status);
    }
    if (minCredits) {
      queryParams.set("minCredits", minCredits);
    }
    if (maxCredits) {
      queryParams.set("maxCredits", maxCredits);
    }
    if (search) {
      queryParams.set("search", search);
    }

    // Call backend API using makeBackendRequest
    const data = await makeBackendRequest(
      `/api/admin/users?${queryParams.toString()}`,
      {
        sessionToken: request.auth.sessionToken,
      }
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
});
