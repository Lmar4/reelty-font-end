import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getSetupIntent(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/payment/setup-intent", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[SETUP_INTENT_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to get setup intent",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getSetupIntent);
  return authHandler(req);
}
