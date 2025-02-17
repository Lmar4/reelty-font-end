import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
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
