import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
  try {
    const data = await makeBackendRequest("/api/admin/videos", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
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
