import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getBusinessKpis(req: AuthenticatedRequest) {
  try {
    const kpis = await makeBackendRequest("/api/admin/stats/business-kpis", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(kpis);
  } catch (error) {
    console.error("[BUSINESS_KPIS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch business KPIs",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getBusinessKpis);
  return authHandler(req);
}
