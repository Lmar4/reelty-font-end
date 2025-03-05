import { sendCreditUpdateEmail } from "@/lib/plunk";
import { auth } from "@clerk/nextjs/server";
import { makeServerBackendRequest } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

interface CreditUpdateResponse {
  email: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  totalCredits: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    // Get session token from Clerk
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await session.getToken();
    if (!token) {
      return NextResponse.json(
        { error: "No session token available" },
        { status: 401 }
      );
    }

    const { agencyId } = await params;
    const body = await req.json();

    // Use makeServerBackendRequest instead of makeBackendRequest
    const data = await makeServerBackendRequest<CreditUpdateResponse>(
      `/api/admin/agencies/${agencyId}/credits`,
      {
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
