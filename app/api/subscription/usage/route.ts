import { NextResponse } from "next/server";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";

interface UsageStats {
  creditsUsed: number;
  activeListings: number;
  totalListings: number;
  totalVideosGenerated: number;
  storageUsed: number;
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

    // Users can only view their own usage stats
    if (request.auth.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const usageStats = await makeBackendRequest<UsageStats>(
      `/api/subscription/usage/${userId}`,
      {
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(usageStats);
  } catch (error) {
    console.error("[SUBSCRIPTION_USAGE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
});
