import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/admin/analytics/videos", {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[VIDEO_ANALYTICS_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch video analytics",
      { status: 500 }
    );
  }
});
