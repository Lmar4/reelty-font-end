import { NextResponse } from "next/server";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";

interface CreditBalance {
  total: number;
  available: number;
  used: number;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const creditBalance = await makeBackendRequest<CreditBalance>(
      "/api/credits/balance",
      {
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(creditBalance);
  } catch (error) {
    console.error("[CREDITS_BALANCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
});
