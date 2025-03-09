import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function getCreditStats(req: AuthenticatedRequest) {
  try {
    console.log("[CREDIT_ANALYTICS_REQUEST] Attempting to fetch credit data");

    const data = await makeBackendRequest("/api/admin/analytics/credits", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    console.log("[CREDIT_ANALYTICS_SUCCESS] Data received");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_ANALYTICS_ERROR]", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("[CREDIT_ANALYTICS_ERROR_DETAILS]", {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch credit analytics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getCreditStats);
  return authHandler(req);
}
