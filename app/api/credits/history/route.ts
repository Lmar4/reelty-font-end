import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { CreditLog } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
  try {
    const response = await makeBackendRequest<CreditLog[]>(
      `/api/credits/history/${req.auth.userId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[CREDIT_HISTORY_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch credit history",
      { status: 500 }
    );
  }
});
