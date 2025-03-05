import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

// Handler function
async function getCreditPackages(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/credits/packages", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_PACKAGES_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch credit packages",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getCreditPackages);
  return authHandler(req);
}
