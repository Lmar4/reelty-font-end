import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function updateUserStatus(
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
}

// Next.js App Router handler
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authHandler = await withAuthServer(updateUserStatus);
  return authHandler(req, context);
}
