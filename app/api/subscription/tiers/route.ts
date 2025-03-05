import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

// Handler function
async function getSubscriptionTiers(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/subscription/tiers", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch subscription tiers",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getSubscriptionTiers);
  return authHandler(req);
}
