import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { status } = await request.json();
    if (!["active", "suspended", "inactive"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const { userId } = await params;

    const result = await makeBackendRequest(
      `/api/admin/users/${userId}/status`,
      {
        method: "POST",
        sessionToken: request.auth.sessionToken,
        headers: {
          "Content-Type": "application/json",
        },
        body: { status },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[STATUS_UPDATE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update status",
      { status: 500 }
    );
  }
});
