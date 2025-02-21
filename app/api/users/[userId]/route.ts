import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import {} from "@/utils/withAuth";
import { User } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Users can only access their own data
    if (req.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const user = await makeBackendRequest<User>(`/api/users/${userId}`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
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

export const PATCH = withAuthServer(async function PATCH(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Users can only update their own data
    if (req.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const user = await makeBackendRequest<User>(`/api/users/${userId}`, {
      method: "PATCH",
      sessionToken: req.auth.sessionToken,
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
