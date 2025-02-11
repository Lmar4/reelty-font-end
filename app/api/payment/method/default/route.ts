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
    const { customerId, paymentMethodId } = await request.json();
    if (!customerId || !paymentMethodId) {
      return new NextResponse(
        "Customer ID and payment method ID are required",
        { status: 400 }
      );
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DEFAULT_PAYMENT_METHOD_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to update default payment method",
      { status: 500 }
    );
  }
});
