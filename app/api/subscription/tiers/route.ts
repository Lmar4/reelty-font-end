import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/tiers`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch subscription tiers");
    }

    const tiers = await response.json();
    return NextResponse.json(tiers);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
