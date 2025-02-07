import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call backend to check credits
    const response = await fetch(
      `${process.env.REELTY_BACKEND_URL}/api/credits/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check credits");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_CHECK_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
