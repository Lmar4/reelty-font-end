import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { SubscriptionTier } from "@/types/prisma-types";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const tiers = await makeBackendRequest<SubscriptionTier[]>(
      "/api/subscription/tiers",
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_GET]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch subscription tiers",
      { status: 500 }
    );
  }
});
