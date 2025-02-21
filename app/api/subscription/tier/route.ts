import { SubscriptionTier } from "@/types/prisma-types";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

interface StripeCustomer {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const GET = withAuthServer(async function PATCH(
  request: AuthenticatedRequest
) {
  try {
    const body = await request.json();
    const { userId, tierId } = body;

    // Users can only update their own subscription
    if (request.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get current subscription details
    const currentSubscription = await makeBackendRequest(
      `/api/subscription/current/${userId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    // Get new tier details
    const newTier = await makeBackendRequest<SubscriptionTier>(
      `/api/subscription/tier/${tierId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    // Get Stripe customer ID
    const { stripeCustomerId, stripeSubscriptionId } =
      await makeBackendRequest<StripeCustomer>(
        `/api/users/${userId}/stripe-customer`,
        {
          method: "GET",
          sessionToken: request.auth.sessionToken,
        }
      );

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
            price: newTier.stripePriceId,
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
    console.error("[SUBSCRIPTION_TIER_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to update subscription tier",
      { status: 500 }
    );
  }
});
