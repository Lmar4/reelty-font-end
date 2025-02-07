import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, paymentMethodId } = await request.json();
    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: "Customer ID and payment method ID are required" },
        { status: 400 }
      );
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({
      data: { success: true },
    });
  } catch (error) {
    console.error("Error updating default payment method:", error);
    return NextResponse.json(
      { error: "Failed to update default payment method" },
      { status: 500 }
    );
  }
}
