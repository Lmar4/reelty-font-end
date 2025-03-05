import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired" | "free";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Handler function
async function getCurrentSubscription(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/subscription/current", {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CURRENT_SUBSCRIPTION_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch current subscription",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getCurrentSubscription);
  return authHandler(req);
}
