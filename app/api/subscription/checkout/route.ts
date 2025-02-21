import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

import { NextResponse } from "next/server";

interface CheckoutRequest {
  userId: string;
  plan: string;
  billingType: "credits" | "monthly";
  returnUrl: string;
}

export const GET = withAuthServer(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const body: CheckoutRequest = await request.json();
    const { userId, plan, billingType, returnUrl } = body;

    // Users can only create checkout sessions for themselves
    if (request.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create checkout session through backend
    const response = await makeBackendRequest<{ url: string }>(
      "/api/subscription/checkout",
      {
        method: "POST",
        sessionToken: request.auth.sessionToken,
        body: {
          userId,
          plan,
          billingType,
          successUrl: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: returnUrl,
        },
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECKOUT_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session",
      { status: 500 }
    );
  }
});
