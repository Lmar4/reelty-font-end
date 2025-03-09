import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { sendPaymentFailureEmail } from "@/lib/plunk";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // Verify the event
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle payment failure events
    if (event.type === "invoice.payment_failed") {
      try {
        const invoice = event.data.object as Stripe.Invoice;

        // Get customer details
        if (invoice.customer) {
          const customer = await stripe.customers.retrieve(
            invoice.customer as string
          );

          if (customer && !customer.deleted) {
            // Get subscription details
            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
              );
              const product = await stripe.products.retrieve(
                subscription.items.data[0].price.product as string
              );

              // Get payment method details if available
              let paymentMethodLast4: string | undefined;
              if (invoice.payment_intent) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                  invoice.payment_intent as string
                );
                if (paymentIntent.payment_method) {
                  const paymentMethod = await stripe.paymentMethods.retrieve(
                    paymentIntent.payment_method as string
                  );
                  paymentMethodLast4 = paymentMethod.card?.last4;
                }
              }

              // Send email notification
              await sendPaymentFailureEmail(
                customer.email!,
                customer.name?.split(" ")[0] || "there",
                product.name,
                invoice.amount_due / 100, // Convert from cents to dollars
                "Your payment method was declined or failed to process",
                new Date(
                  subscription.current_period_end * 1000
                ).toLocaleDateString(),
                paymentMethodLast4
              );

              console.log(`Payment failure email sent to ${customer.email}`);
            }
          }
        }
      } catch (emailError) {
        // Log email error but don't fail the webhook processing
        console.error("[PAYMENT_FAILURE_EMAIL_ERROR]", emailError);
      }
    }

    // Forward the webhook to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/webhook/stripe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": signature,
          Authorization: `Bearer ${process.env.REELTY_API_KEY}`,
        },
        body,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[WEBHOOK_ERROR]", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: response.status }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
