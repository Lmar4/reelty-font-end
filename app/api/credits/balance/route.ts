import { makeBackendRequest } from "@/utils/withAuth";
import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
interface CreditBalance {
  total: number;
  available: number;
  used: number;
}

export const GET = withAuthServer(async (req: AuthenticatedRequest) => {
  try {
    const creditBalance = await makeBackendRequest<CreditBalance>(
      "/api/credits/balance",
      {
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(creditBalance);
  } catch (error) {
    console.error("[CREDITS_BALANCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
});
