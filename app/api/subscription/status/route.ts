import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/api";
import { SubscriptionTier } from "@/types/prisma-types";

interface SubscriptionStatus {
  status: string;
  tier: SubscriptionTier;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Users can only view their own subscription status
    if (request.auth.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const subscriptionStatus = await makeBackendRequest<SubscriptionStatus>(
      `/api/subscription/status/${userId}`,
      {
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(subscriptionStatus);
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
});
