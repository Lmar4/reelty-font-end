import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import SubscriptionEmail from "@/emails/SubscriptionEmail";
import { plans, type Plan } from "@/components/onboarding/PlanSelection";
import { AuthenticatedRequest } from "@/utils/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Handler function
async function verifyPayment(req: AuthenticatedRequest) {
  try {
    const body = await req.json();

    const data = await makeBackendRequest("/api/verify-payment", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[VERIFY_PAYMENT_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to verify payment",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(verifyPayment);
  return authHandler(req);
}
