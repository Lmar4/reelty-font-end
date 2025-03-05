import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getUserStats(req: AuthenticatedRequest) {
  try {
    const stats = await makeBackendRequest("/api/admin/stats/users", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[USER_STATS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch user stats",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getUserStats);
  return authHandler(req);
}
