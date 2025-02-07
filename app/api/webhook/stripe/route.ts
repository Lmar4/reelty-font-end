import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import {
  sendCreditPurchaseEmail,
  sendSubscriptionChangeEmail,
  sendPaymentFailureEmail,
} from "@/lib/plunk";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error("[STRIPE_WEBHOOK_ERROR]", error);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        // Fetch subscription details
        const subscriptionWithPrice = await stripe.subscriptions.retrieve(
          subscription.id,
          {
            expand: ["items.data.price.product"],
          }
        );

        const currentPeriodEnd = new Date(
          subscription.current_period_end * 1000
        );
        const formattedNextBillingDate = currentPeriodEnd.toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        // Get the price details
        const priceId = subscriptionWithPrice.items.data[0].price.id;
        const productId = (
          subscriptionWithPrice.items.data[0].price.product as Stripe.Product
        ).id;

        // Update user's subscription in our backend
        const response = await fetch(
          `${process.env.REELTY_BACKEND_URL}/api/subscription/update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
            },
            body: JSON.stringify({
              userId,
              stripeSubscriptionId: subscription.id,
              priceId,
              productId,
              status: subscription.status,
              currentPeriodEnd: subscription.current_period_end,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update subscription in backend");
        }

        // If this is a subscription update (not creation), send change email
        if (
          event.type === "customer.subscription.updated" &&
          subscription.metadata.previousPriceId
        ) {
          // Fetch user details
          const userResponse = await fetch(
            `${process.env.REELTY_BACKEND_URL}/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
              },
            }
          );

          if (!userResponse.ok) {
            throw new Error("Failed to fetch user details");
          }

          const user = await userResponse.json();

          // Get previous price details
          const previousPrice = await stripe.prices.retrieve(
            subscription.metadata.previousPriceId,
            {
              expand: ["product"],
            }
          );

          const currentPrice = subscriptionWithPrice.items.data[0].price;
          const currentProduct = currentPrice.product as Stripe.Product;
          const previousProduct = previousPrice.product as Stripe.Product;

          // Calculate prorated amounts if applicable
          const proratedChanges = await stripe.invoices.retrieveUpcoming({
            customer: subscription.customer as string,
            subscription: subscription.id,
          });

          const effectiveDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          // Send subscription change email
          await sendSubscriptionChangeEmail(
            user.email,
            user.firstName || "there",
            previousProduct.name,
            currentProduct.name,
            previousPrice.unit_amount! / 100,
            currentPrice.unit_amount! / 100,
            currentProduct.metadata.features
              ? JSON.parse(currentProduct.metadata.features)
              : [],
            effectiveDate,
            formattedNextBillingDate
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        // Update user's subscription status in our backend
        await fetch(
          `${process.env.REELTY_BACKEND_URL}/api/subscription/cancel`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
            },
            body: JSON.stringify({
              userId,
              stripeSubscriptionId: subscription.id,
            }),
          }
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
          {
            expand: ["items.data.price.product"],
          }
        );

        const userId = subscription.metadata.userId;
        if (!userId) break;

        // Fetch user details
        const userResponse = await fetch(
          `${process.env.REELTY_BACKEND_URL}/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const user = await userResponse.json();
        const product = subscription.items.data[0].price
          .product as Stripe.Product;

        // Get payment method details if available
        let paymentMethodLast4: string | undefined;
        if (invoice.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            invoice.payment_intent as string,
            {
              expand: ["payment_method"],
            }
          );
          paymentMethodLast4 = (
            paymentIntent.payment_method as Stripe.PaymentMethod
          )?.card?.last4;
        }

        // Format next payment attempt date
        const nextAttemptDate = invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )
          : undefined;

        // Send payment failure email
        await sendPaymentFailureEmail(
          user.email,
          user.firstName || "there",
          product.name,
          invoice.amount_due / 100,
          invoice.last_finalization_error?.message || "Payment was declined",
          nextAttemptDate,
          paymentMethodLast4
        );
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === "credit_purchase") {
          const userId = session.metadata.userId;
          const credits = parseInt(session.metadata.credits);
          const amount = session.amount_total! / 100;

          // Fetch user details
          const response = await fetch(
            `${process.env.REELTY_BACKEND_URL}/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }

          const user = await response.json();

          // Send confirmation email
          await sendCreditPurchaseEmail(user.email, user.name, credits, amount);

          // Add credits to user's account
          await fetch(`${process.env.REELTY_BACKEND_URL}/api/credits/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
            },
            body: JSON.stringify({
              userId,
              credits,
              reason: "Credit purchase",
              transactionId: session.id,
            }),
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
