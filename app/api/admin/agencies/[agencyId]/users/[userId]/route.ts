import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const DELETE = withAuth(async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: { agencyId: string; userId: string } }
) {
  try {
    const { agencyId, userId } = params;

    const result = await makeBackendRequest(
      `/api/admin/agencies/${agencyId}/users/${userId}`,
      {
        method: "DELETE",
        sessionToken: request.auth.sessionToken,
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
