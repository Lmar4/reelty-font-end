import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { User } from "@/types/prisma-types";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const user = await makeBackendRequest<User>(
      `/api/users/${request.auth.userId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_ME_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch user data",
      { status: 500 }
    );
  }
});
