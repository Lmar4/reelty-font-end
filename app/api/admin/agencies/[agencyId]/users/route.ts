import { NextResponse } from "next/server";
import { sendAgencyInviteEmail } from "@/lib/plunk";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";

interface AgencyUserResponse {
  email: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  inviteToken: string;
}

export const GET = withAuth(
  async (
    request: AuthenticatedRequest,
    { params }: { params: { agencyId: string } }
  ) => {
    try {
      const data = await makeBackendRequest<AgencyUserResponse[]>(
        `/api/admin/agencies/${params.agencyId}/users`,
        {
          sessionToken: request.auth.sessionToken,
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

export const POST = withAuth(
  async (
    request: AuthenticatedRequest,
    { params }: { params: { agencyId: string } }
  ) => {
    try {
      const body = await request.json();
      const { sendInvite, ...userData } = body;

      const data = await makeBackendRequest<AgencyUserResponse>(
        `/api/admin/agencies/${params.agencyId}/users`,
        {
          method: "POST",
          body: userData,
          sessionToken: request.auth.sessionToken,
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
