import { AuthenticatedRequest, withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const {
      priceId,
      planId,
      isOneTime = false,
      credits = 0,
      successUrl,
      cancelUrl,
    } = await request.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isOneTime ? "payment" : "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: request.auth.userId,
        planId,
        isOneTime: isOneTime.toString(),
        credits: credits.toString(),
        type: isOneTime ? "credit_purchase" : "subscription",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_SESSION_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session",
      { status: 500 }
    );
  }
});
