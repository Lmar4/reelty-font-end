import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface CheckoutRequest {
  userId: string;
  plan: string;
  billingType: "credits" | "monthly";
  returnUrl: string;
}

// Handler function
async function createCheckoutSession(req: AuthenticatedRequest) {
  try {
    const body = await req.json();

    const data = await makeBackendRequest("/api/subscription/checkout", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECKOUT_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(createCheckoutSession);
  return authHandler(req);
}
