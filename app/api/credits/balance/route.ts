import { makeBackendRequest } from "@/utils/withAuth";
import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { AuthenticatedRequest } from "@/utils/types";

interface CreditBalance {
  total: number;
  available: number;
  used: number;
}

// Handler function
async function getCreditBalance(req: AuthenticatedRequest) {
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
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getCreditBalance);
  return authHandler(req);
}
