import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import SubscriptionEmail from "@/emails/SubscriptionEmail";
import { plans, type Plan } from "@/components/onboarding/PlanSelection";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Update user's subscription status in your database
    await fetch(`${process.env.BACKEND_URL}/api/users/${userId}/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
      },
      body: JSON.stringify({
        planId: session.metadata?.planId,
        stripeSubscriptionId: session.subscription as string,
        status: "active",
      }),
    });

    // Send subscription confirmation email
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = plans.find((p: Plan) => p.id === session.metadata?.planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const emailHtml = render(
      SubscriptionEmail({
        firstName: user.firstName || "there",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.reelty.com",
        planName: plan.name,
        planPrice: plan.price,
        planFeatures: plan.features,
      })
    );

    await fetch("https://api.useplunk.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PLUNK_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        html: emailHtml,
        subject: "Your Reelty Subscription is Confirmed!",
        to: user.emailAddresses[0].emailAddress,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}
