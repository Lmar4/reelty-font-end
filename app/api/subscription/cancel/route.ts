import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, stripeSubscriptionId, reason, feedback } = body;

    // Users can only cancel their own subscription
    if (authUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        cancellationReason: reason,
        cancellationFeedback: feedback || "",
      },
    });

    // The webhook will handle updating the user's subscription status in our database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUBSCRIPTION_CANCEL]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}
