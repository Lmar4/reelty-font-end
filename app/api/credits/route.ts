import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getUserCredits(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/credits", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDITS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch user credits",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getUserCredits);
  return authHandler(req);
}
