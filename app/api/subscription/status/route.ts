import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";
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

// Handler function
async function getSubscriptionStatus(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
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
    if (req.auth.userId !== userId) {
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
        sessionToken: req.auth.sessionToken,
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
    console.error("[SUBSCRIPTION_STATUS_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch subscription status",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getSubscriptionStatus);
  return authHandler(req);
}
