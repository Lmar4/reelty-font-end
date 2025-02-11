import { NextResponse } from "next/server";
import { sendCreditUpdateEmail } from "@/lib/plunk";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";

interface CreditUpdateResponse {
  email: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  totalCredits: number;
}

export const POST = withAuth(
  async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ agencyId: string }> }
  ) => {
    try {
      const { agencyId } = await params;
      const body = await request.json();
      const data = await makeBackendRequest<CreditUpdateResponse>(
        `/api/admin/agencies/${agencyId}/credits`,
        {
          method: "POST",
          body,
          sessionToken: request.auth.sessionToken,
        }
      );

      // Send email notification about credit update
      try {
        await sendCreditUpdateEmail({
          to: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          agencyName: data.agencyName,
          creditsAdded: Math.abs(body.amount),
          totalCredits: data.totalCredits,
          reason: body.reason,
        });
      } catch (emailError) {
        console.error("[SEND_CREDIT_UPDATE_EMAIL]", emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error("[AGENCY_CREDITS_POST]", error);
      return new NextResponse(
        error instanceof Error ? error.message : "Internal error",
        { status: 500 }
      );
    }
  }
);
