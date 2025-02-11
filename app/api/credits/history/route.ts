import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { CreditLog } from "@/types/prisma-types";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest<CreditLog[]>(
      `/api/credits/history/${request.auth.userId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_HISTORY_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch credit history",
      { status: 500 }
    );
  }
});
