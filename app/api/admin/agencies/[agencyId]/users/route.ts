import { NextResponse } from "next/server";
import { sendAgencyInviteEmail } from "@/lib/plunk";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

interface AgencyUserResponse {
  email: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  inviteToken: string;
}

export const GET = withAuthServer(
  async (
    req: AuthenticatedRequest,
    { params }: { params: Promise<{ agencyId: string }> }
  ) => {
    try {
      const { agencyId } = await params;
      const data = await makeBackendRequest<AgencyUserResponse[]>(
        `/api/admin/agencies/${agencyId}/users`,
        {
          sessionToken: req.auth.sessionToken,
        }
      );

      return NextResponse.json(data);
    } catch (error) {
      console.error("[AGENCY_USERS_GET]", error);
      return new NextResponse(
        error instanceof Error ? error.message : "Internal error",
        { status: 500 }
      );
    }
  }
);

export const POST = withAuthServer(
  async (
    req: AuthenticatedRequest,
    { params }: { params: Promise<{ agencyId: string }> }
  ) => {
    try {
      const { agencyId } = await params;
      const body = await req.json();
      const { sendInvite, ...userData } = body;

      const data = await makeBackendRequest<AgencyUserResponse>(
        `/api/admin/agencies/${agencyId}/users`,
        {
          method: "POST",
          body: userData,
          sessionToken: req.auth.sessionToken,
        }
      );

      if (sendInvite) {
        try {
          await sendAgencyInviteEmail({
            to: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            agencyName: data.agencyName,
            inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${data.inviteToken}`,
            initialCredits: userData.initialCredits,
          });
        } catch (emailError) {
          console.error("[SEND_INVITE_EMAIL]", emailError);
          // Don't fail the request if email fails
        }
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error("[AGENCY_USERS_POST]", error);
      return new NextResponse(
        error instanceof Error ? error.message : "Internal error",
        { status: 500 }
      );
    }
  }
);
