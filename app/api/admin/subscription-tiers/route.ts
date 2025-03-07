import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";
import { z } from "zod";

const subscriptionTierSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  monthlyPrice: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
  creditExpirationDays: z.coerce
    .number()
    .min(1, "Credit expiration must be at least 1 day")
    .max(365, "Credit expiration cannot exceed 365 days"),
  creditRolloverMonths: z.coerce
    .number()
    .min(0, "Credit rollover cannot be negative")
    .max(12, "Credit rollover cannot exceed 12 months"),
  hasWatermark: z.boolean(),
  maxPhotosPerListing: z.coerce
    .number()
    .min(1, "Must allow at least 1 photo per listing")
    .max(100, "Cannot exceed 100 photos per listing"),
  maxReelDownloads: z.union([
    z.coerce.number().min(1, "Must allow at least 1 download"),
    z.literal(null).transform(() => null),
  ]),
  maxActiveListings: z.coerce
    .number()
    .min(1, "Must allow at least 1 active listing")
    .max(1000, "Cannot exceed 1000 active listings"),
});

// Handler functions
async function getSubscriptionTiers(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const response = await makeBackendRequest<any>(
      `/api/admin/subscription-tiers?page=${page}&limit=${limit}`,
      {
        sessionToken: request.auth.sessionToken,
      }
    );

    // Ensure data is always an array
    const responseData = response.data || [];
    const dataArray = Array.isArray(responseData)
      ? responseData
      : [responseData];

    return NextResponse.json({
      success: true,
      data: dataArray,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription tiers", data: [] },
      { status: 500 }
    );
  }
}

async function createSubscriptionTier(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = subscriptionTierSchema.parse(body);

    const data = await makeBackendRequest("/api/admin/subscription-tiers", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: JSON.stringify(validatedData),
    });

    return NextResponse.json({ success: true, data });
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
}

async function updateSubscriptionTier(request: AuthenticatedRequest) {
  try {
    const tierId = request.url.split("/").pop();
    if (!tierId) {
      return NextResponse.json(
        { success: false, error: "Missing tier ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionTierSchema.parse(body);

    const data = await makeBackendRequest(
      `/api/admin/subscription-tiers/${tierId}`,
      {
        method: "PATCH",
        sessionToken: request.auth.sessionToken,
        body: JSON.stringify(validatedData),
      }
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[SUBSCRIPTION_TIERS_PATCH]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update subscription tier" },
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getSubscriptionTiers);
  return authHandler(req);
}

export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(createSubscriptionTier);
  return authHandler(req);
}

export async function PATCH(req: NextRequest) {
  const authHandler = await withAuthServer(updateSubscriptionTier);
  return authHandler(req);
}
