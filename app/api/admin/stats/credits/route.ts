import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function getCreditStats(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/admin/analytics/credits", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_ANALYTICS_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch credit analytics",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getCreditStats);
  return authHandler(req);
}
