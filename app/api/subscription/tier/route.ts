import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, tierId } = body;

    // Users can only update their own subscription
    if (authUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/tier`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authUserId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, tierId }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("Subscription tier not found", { status: 404 });
      }
      throw new Error("Failed to update subscription tier");
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
