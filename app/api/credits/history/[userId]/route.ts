import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

interface CreditHistoryData {
  transactions: Array<{
    id: string;
    amount: number;
    timestamp: string;
    type: string;
  }>;
}

export const GET = withAuthServer(async function GET(
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
});
