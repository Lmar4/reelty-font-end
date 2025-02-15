import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const credits = await makeBackendRequest<{ credits: number }>(
      `/api/credits/${request.auth.userId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(credits);
  } catch (error) {
    console.error("[CREDITS_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch credits",
      { status: 500 }
    );
  }
});
