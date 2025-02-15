import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const stats = await makeBackendRequest("/api/admin/stats/users", {
      method: "GET",
      sessionToken: request.auth.sessionToken,
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
