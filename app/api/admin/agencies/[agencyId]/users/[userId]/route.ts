import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function DELETE(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ agencyId: string; userId: string }> }
) {
  try {
    const { agencyId, userId } = await params;

    const result = await makeBackendRequest(
      `/api/admin/agencies/${agencyId}/users/${userId}`,
      {
        method: "DELETE",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AGENCY_USER_DELETE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
});
