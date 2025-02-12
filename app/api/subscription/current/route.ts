import { NextResponse } from "next/server";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired" | "free";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const subscription = await makeBackendRequest<Subscription>("/api/subscription/current", {
      sessionToken: request.auth.sessionToken,
    });
    console.log(subscription);
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("[SUBSCRIPTION_CURRENT_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
});
