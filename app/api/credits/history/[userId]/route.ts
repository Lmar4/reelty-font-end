import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface CreditHistoryData {
  transactions: Array<{
    id: string;
    amount: number;
    timestamp: string;
    type: string;
  }>;
}

// Handler function
async function getCreditHistory(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const data = await makeBackendRequest<CreditHistoryData>(
      `/api/credits/history/${userId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[CREDIT_HISTORY_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch credit history",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authHandler = await withAuthServer(getCreditHistory);
  return authHandler(req, context);
}
