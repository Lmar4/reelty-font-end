import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function checkCredits(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/credits/check", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_CHECK_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to check credits",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(checkCredits);
  return authHandler(req);
}
