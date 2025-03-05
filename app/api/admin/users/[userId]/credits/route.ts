import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function adjustUserCredits(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { amount, reason } = body;

    if (typeof amount !== "number") {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Amount must be a number",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!reason || typeof reason !== "string") {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Reason is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await makeBackendRequest(
      `/api/admin/users/${userId}/credits`,
      {
        method: "POST",
        body: { amount, reason },
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CREDITS_ADJUST]", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Next.js App Router handler
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authHandler = await withAuthServer(adjustUserCredits);
  return authHandler(req, context);
}
