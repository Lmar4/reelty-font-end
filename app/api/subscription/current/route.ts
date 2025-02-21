import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired" | "free";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const GET = withAuthServer(async (req: AuthenticatedRequest) => {
  try {
    const subscription = await makeBackendRequest<Subscription>(
      "/api/subscription/current",
      {
        sessionToken: req.auth.sessionToken,
      }
    );
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("[SUBSCRIPTION_CURRENT_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
});
