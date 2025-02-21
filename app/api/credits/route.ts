import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
  try {
    const credits = await makeBackendRequest<{ credits: number }>(
      `/api/credits/${req.auth.userId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
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
