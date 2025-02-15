import { NextResponse } from "next/server";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const tiers = await makeBackendRequest<SubscriptionTier[]>(
      "/api/subscription/tiers",
      {
        sessionToken: request.auth.sessionToken,
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
