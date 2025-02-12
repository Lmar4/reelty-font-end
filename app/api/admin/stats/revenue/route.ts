import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/admin/stats/revenue", {
      method: "GET",
      sessionToken: request.auth.sessionToken,
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
