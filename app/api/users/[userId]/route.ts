import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

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

export async function GET_ADMIN(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // In a real app, you would fetch user data from your backend API
    // For now, we'll return mock data
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      // If the backend API fails, return mock data for development
      return NextResponse.json({
        id: userId,
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        notificationReelsReady: true,
        notificationProductUpdates: true,
      });
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
