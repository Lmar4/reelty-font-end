import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface UsageStats {
  creditsUsed: number;
  activeListings: number;
  totalListings: number;
  totalVideosGenerated: number;
  storageUsed: number;
}

// Handler function
async function getSubscriptionUsage(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Users can only view their own usage stats
    if (req.auth.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const usageStats = await makeBackendRequest<UsageStats>(
      `/api/subscription/usage`,
      {
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json({ data: usageStats });
  } catch (error) {
    console.error("[SUBSCRIPTION_USAGE_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch subscription usage",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getSubscriptionUsage);
  return authHandler(req);
}
