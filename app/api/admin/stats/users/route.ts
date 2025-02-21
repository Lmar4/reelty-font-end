import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
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
});
