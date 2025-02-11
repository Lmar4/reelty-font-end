import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";
import { z } from "zod";

const subscriptionTierSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  stripePriceId: z.string().min(1),
  stripeProductId: z.string().min(1),
  features: z.array(z.string()),
  monthlyPrice: z.number().positive(),
});

// GET /api/admin/subscription-tiers
export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/subscription-tiers?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${request.auth.sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscription tiers");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription tiers" },
      { status: 500 }
    );
  }
});

// POST /api/admin/subscription-tiers
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const validatedData = subscriptionTierSchema.parse(body);

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/subscription-tiers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.auth.sessionToken}`,
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create subscription tier");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create subscription tier" },
      { status: 500 }
    );
  }
});
