import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export const GET = withAuthServer(async (req: AuthenticatedRequest) => {
  try {
    const tiers = await makeBackendRequest<SubscriptionTier[]>(
      "/api/subscription/tiers",
      {
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription tiers" },
      { status: 500 }
    );
  }
});
