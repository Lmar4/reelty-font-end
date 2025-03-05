import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

import { User } from "@/types/prisma-types";

// Handler functions
async function getUser(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Users can only access their own data
    if (req.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const data = await makeBackendRequest(`/api/users/${userId}`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[USER_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch user",
      { status: 500 }
    );
  }
}

async function updateUser(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();

    // Users can only update their own data
    if (req.auth.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const data = await makeBackendRequest(`/api/users/${userId}`, {
      method: "PATCH",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update user",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authHandler = await withAuthServer(getUser);
  return authHandler(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authHandler = await withAuthServer(updateUser);
  return authHandler(req, context);
}
