import { AuthenticatedRequest, withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const { priceId, successUrl, cancelUrl } = await request.json();

    // Placeholder response for future Stripe configuration
    return new NextResponse(
      "Stripe configuration is pending.",
      { status: 501 } // Not Implemented
    );
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
