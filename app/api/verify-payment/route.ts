import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import SubscriptionEmail from "@/emails/SubscriptionEmail";
import { plans, type Plan } from "@/components/onboarding/PlanSelection";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const GET = withAuthServer(async function POST(
  req: AuthenticatedRequest
) {
  try {
    const { sessionId } = await req.json();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new NextResponse("Payment not completed", { status: 400 });
    }

    // Update user's subscription status in your database
    await makeBackendRequest(`/api/users/${req.auth.userId}/subscription`, {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body: {
        planId: session.metadata?.planId,
        stripeSubscriptionId: session.subscription as string,
        status: "active",
        contentType: "application/json",
      },
    });

    // Send subscription confirmation email
    const user = await currentUser();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const plan = plans.find((p: Plan) => p.id === session.metadata?.planId);
    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 });
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
    console.error("[PAYMENT_VERIFICATION_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to verify payment",
      { status: 500 }
    );
  }
});
