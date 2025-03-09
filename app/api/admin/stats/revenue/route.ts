import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function getRevenueStats(req: AuthenticatedRequest) {
  try {
    console.log("[REVENUE_ANALYTICS_REQUEST] Attempting to fetch revenue data");

    const data = await makeBackendRequest("/api/admin/analytics/revenue", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    console.log("[REVENUE_ANALYTICS_SUCCESS] Data received");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[REVENUE_ANALYTICS_ERROR]", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("[REVENUE_ANALYTICS_ERROR_DETAILS]", {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch revenue analytics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getRevenueStats);
  return authHandler(req);
}
