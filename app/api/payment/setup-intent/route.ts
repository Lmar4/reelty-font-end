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
    const { customerId } = await request.json();
    if (!customerId) {
      return new NextResponse("Customer ID is required", { status: 400 });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error("[SETUP_INTENT_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create setup intent",
      { status: 500 }
    );
  }
});
