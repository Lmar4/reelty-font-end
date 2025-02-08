import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, reason } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid credit amount" },
        { status: 400 }
      );
    }

    // Call backend to deduct credits
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/credits/deduct`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          reason: reason || "Video generation",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 400) {
        return NextResponse.json(error, { status: 400 });
      }
      throw new Error("Failed to deduct credits");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_DEDUCTION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
