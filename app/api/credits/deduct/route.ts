import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";
import { checkAndNotifyLowBalance } from "@/lib/plunk";

// Define response types
interface CreditDeductionResponse {
  success: boolean;
  data?: {
    creditsRemaining: number;
  };
  error?: string;
}

interface UserResponse {
  success: boolean;
  data?: {
    email: string;
    id: string;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
}

// Handler function
async function deductCredits(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { amount, reason } = body;

    if (!amount || amount <= 0) {
      return new NextResponse("Invalid credit amount", { status: 400 });
    }

    const data = await makeBackendRequest<CreditDeductionResponse>(
      "/api/credits/deduct",
      {
        method: "POST",
        sessionToken: request.auth.sessionToken,
        body: {
          amount,
          reason: reason || "Video generation",
          contentType: "application/json",
        },
      }
    );

    // Check if the response contains the user's remaining credits
    if (data.success && data.data && data.data.creditsRemaining !== undefined) {
      try {
        // Get user's email from the session
        const userResponse = await makeBackendRequest<UserResponse>(
          "/api/users/me",
          {
            method: "GET",
            sessionToken: request.auth.sessionToken,
          }
        );

        if (
          userResponse.success &&
          userResponse.data &&
          userResponse.data.email
        ) {
          // Check if balance is low and notify if needed
          await checkAndNotifyLowBalance(
            userResponse.data.email,
            data.data.creditsRemaining,
            "credits", // Using "credits" as the currency
            5 // Default threshold of 5 credits
          );
        }
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("[LOW_BALANCE_EMAIL_ERROR]", emailError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_DEDUCTION_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to deduct credits",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(deductCredits);
  return authHandler(req);
}
