import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Create a handler function that follows Next.js route handler pattern
async function deleteAgencyUser(
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
}

// Export the DELETE handler with Next.js App Router format
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ agencyId: string; userId: string }> }
) {
  // Use the withAuthServer HOC to wrap our handler
  const authHandler = await withAuthServer(deleteAgencyUser);
  // Call the wrapped handler with the request and context
  return authHandler(req, context);
}
