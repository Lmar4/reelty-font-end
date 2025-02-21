import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
  try {
    const data = await makeBackendRequest("/api/admin/stats/revenue", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[REVENUE_ANALYTICS_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch revenue analytics",
      { status: 500 }
    );
  }
});
