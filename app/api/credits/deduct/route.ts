import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function deductCredits(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { amount, reason } = body;

    if (!amount || amount <= 0) {
      return new NextResponse("Invalid credit amount", { status: 400 });
    }

    const data = await makeBackendRequest("/api/credits/deduct", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: {
        amount,
        reason: reason || "Video generation",
        contentType: "application/json",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_DEDUCTION_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to deduct credits",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(deductCredits);
  return authHandler(req);
}
