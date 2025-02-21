import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function POST(
  req: AuthenticatedRequest
) {
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
});
