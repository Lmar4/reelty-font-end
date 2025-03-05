import { NextRequest, NextResponse } from "next/server";
import { sendAgencyInviteEmail } from "@/lib/plunk";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface AgencyUserResponse {
  email: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  inviteToken: string;
}

// Create handler functions that follow Next.js route handler pattern
async function getAgencyUsers(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ agencyId: string }> }
) {
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

async function createAgencyUser(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ agencyId: string }> }
) {
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

// Export the GET handler with Next.js App Router format
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ agencyId: string }> }
) {
  // Use the withAuthServer HOC to wrap our handler
  const authHandler = await withAuthServer(getAgencyUsers);
  // Call the wrapped handler with the request and context
  return authHandler(req, context);
}

// Export the POST handler with Next.js App Router format
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ agencyId: string }> }
) {
  // Use the withAuthServer HOC to wrap our handler
  const authHandler = await withAuthServer(createAgencyUser);
  // Call the wrapped handler with the request and context
  return authHandler(req, context);
}
