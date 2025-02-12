import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const data = await makeBackendRequest("/api/credits/check", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
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
