import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { plan, billingType, returnUrl } = body;

    if (!plan || !billingType || !returnUrl) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Call our backend API to create checkout session
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/create-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          plan,
          billingType,
          returnUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[CREATE_CHECKOUT_ERROR]", error);
      return new NextResponse("Failed to create checkout session", {
        status: response.status,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREATE_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
