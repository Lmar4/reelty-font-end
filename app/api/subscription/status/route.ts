import { makeBackendRequest } from "@/utils/api";
import { AuthenticatedRequest, withAuth } from "@/utils/withAuthServer";
import { NextResponse } from "next/server";
import { z } from "zod";

interface SubscriptionStatus {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Validation schema
const querySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      userId: searchParams.get("userId"),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId } = result.data;

    // Users can only view their own subscription status
    if (request.auth.userId !== userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You can only view your own subscription status",
        },
        { status: 403 }
      );
    }

    const subscriptionStatus = await makeBackendRequest<SubscriptionStatus>(
      `/api/subscription/current`,
      {
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(
      { data: subscriptionStatus },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_GET]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch subscription status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
