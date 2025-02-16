import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/api";
import { User } from "@/types/prisma-types";

export const GET = withAuth(async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Users can only access their own data
    if (request.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const user = await makeBackendRequest<User>(`/api/users/${userId}`, {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch user",
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Users can only update their own data
    if (request.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const user = await makeBackendRequest<User>(`/api/users/${userId}`, {
      method: "PATCH",
      sessionToken: request.auth.sessionToken,
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update user",
      { status: 500 }
    );
  }
});
