import { SubscriptionTier } from "@/types/prisma-types";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedRequest } from "@/utils/types";
import Stripe from "stripe";

interface StripeCustomer {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Handler function
async function updateSubscriptionTier(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { userId, tierId } = body;

    // Users can only update their own subscription
    if (req.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get current subscription details
    const currentSubscription = await makeBackendRequest(
      `/api/subscription/current/${userId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    // Get new tier details
    const newTier = await makeBackendRequest<SubscriptionTier>(
      `/api/subscription/tier/${tierId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    // Get Stripe customer ID
    const { stripeCustomerId, stripeSubscriptionId } =
      await makeBackendRequest<StripeCustomer>(
        `/api/users/${userId}/stripe-customer`,
        {
          method: "GET",
          sessionToken: req.auth.sessionToken,
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
    console.error("[UPDATE_SUBSCRIPTION_TIER_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to update subscription tier",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function PATCH(req: NextRequest) {
  const authHandler = await withAuthServer(updateSubscriptionTier);
  return authHandler(req);
}
