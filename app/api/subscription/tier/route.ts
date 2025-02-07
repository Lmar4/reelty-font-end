import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendSubscriptionChangeEmail } from "@/lib/plunk";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function PATCH(request: Request) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, tierId } = body;

    // Users can only update their own subscription
    if (authUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get current subscription details
    const currentResponse = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/current/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authUserId}`,
        },
      }
    );

    if (!currentResponse.ok) {
      throw new Error("Failed to fetch current subscription");
    }

    const currentSubscription = await currentResponse.json();

    // Get new tier details
    const newTierResponse = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/tier/${tierId}`,
      {
        headers: {
          Authorization: `Bearer ${authUserId}`,
        },
      }
    );

    if (!newTierResponse.ok) {
      if (newTierResponse.status === 404) {
        return new NextResponse("Subscription tier not found", { status: 404 });
      }
      throw new Error("Failed to fetch new tier details");
    }

    const newTier = await newTierResponse.json();

    // Get Stripe customer ID
    const customerResponse = await fetch(
      `${process.env.BACKEND_URL}/api/users/${userId}/stripe-customer`,
      {
        headers: {
          Authorization: `Bearer ${authUserId}`,
        },
      }
    );

    if (!customerResponse.ok) {
      throw new Error("Failed to fetch Stripe customer");
    }

    const { stripeCustomerId, stripeSubscriptionId } =
      await customerResponse.json();

    if (!stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    // If there's an existing subscription, update it
    if (stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId
      );
      const currentPriceId = subscription.items.data[0].price.id;

      // Update the subscription with the new price
      await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newTier.stripePriceId, // Make sure your tier object includes stripePriceId
          },
        ],
        proration_behavior: "always_invoice", // This will trigger immediate proration
        metadata: {
          userId,
          previousPriceId: currentPriceId,
        },
      });
    } else {
      // Create a new subscription
      await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: newTier.stripePriceId }],
        metadata: {
          userId,
        },
      });
    }

    // The subscription update webhook will handle updating the database and sending emails
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUBSCRIPTION_TIER_PATCH]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}
