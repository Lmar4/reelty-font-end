import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId =
      customer.deleted !== true
        ? (customer as Stripe.Customer).invoice_settings?.default_payment_method
        : null;

    const formattedPaymentMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand || "unknown",
      last4: method.card?.last4 || "****",
      expMonth: method.card?.exp_month || 0,
      expYear: method.card?.exp_year || 0,
      isDefault: method.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({
      data: formattedPaymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
