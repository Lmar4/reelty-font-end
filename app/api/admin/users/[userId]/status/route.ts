import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { status } = await request.json();
    const { userId } = await params;

    const result = await makeBackendRequest(
      `/api/admin/users/${userId}/status`,
      {
        method: "PATCH",
        sessionToken: request.auth.sessionToken,
        body: { status, contentType: "application/json" },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[STATUS_UPDATE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
});
