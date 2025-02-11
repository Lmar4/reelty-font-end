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
    const { adjustment } = await request.json();
    if (typeof adjustment !== "number") {
      return new NextResponse("Invalid credit adjustment", { status: 400 });
    }

    const { userId } = await params;

    const result = await makeBackendRequest(
      `/api/admin/users/${userId}/credits`,
      {
        method: "POST",
        sessionToken: request.auth.sessionToken,
        headers: {
          "Content-Type": "application/json",
        },
        body: { adjustment },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CREDITS_ADJUST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to adjust credits",
      { status: 500 }
    );
  }
});
