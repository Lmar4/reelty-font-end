import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";
import * as plunk from "@/lib/plunk";

interface CreditAdjustmentResult {
  success: boolean;
  data: {
    creditsRemaining: number;
  };
  error?: string;
}

interface UserResult {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    notificationProductUpdates?: boolean;
  };
  error?: string;
}

// Handler function
async function adjustUserCredits(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { amount, reason } = body;

    if (typeof amount !== "number") {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Amount must be a number",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!reason || typeof reason !== "string") {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Reason is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await makeBackendRequest<CreditAdjustmentResult>(
      `/api/admin/users/${userId}/credits`,
      {
        method: "POST",
        body: { amount, reason },
        sessionToken: request.auth.sessionToken,
      }
    );

    // If credit adjustment was successful, send email notification
    if (result.success && amount > 0) {
      try {
        // Get user details
        const userResult = await makeBackendRequest<UserResult>(
          `/api/users/${userId}`,
          {
            method: "GET",
            sessionToken: request.auth.sessionToken,
          }
        );

        if (userResult.success && userResult.data) {
          const user = userResult.data;

          // Check if user has enabled product update notifications
          if (user.notificationProductUpdates) {
            // Send email notification
            await plunk.sendCreditPurchaseEmail(
              user.email,
              user.firstName || "there",
              amount,
              0 // No cost since it's an admin grant
            );

            console.log(`Credit adjustment email sent to ${user.email}`);
          }
        }
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("[CREDITS_EMAIL_ERROR]", emailError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CREDITS_ADJUST]", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Next.js App Router handler
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authHandler = await withAuthServer(adjustUserCredits);
  return authHandler(req, context);
}
