import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Activity } from "@/types/prisma-types";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const activities = await makeBackendRequest<Activity[]>(
      "/api/admin/activity",
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITY_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch activity",
      { status: 500 }
    );
  }
});
