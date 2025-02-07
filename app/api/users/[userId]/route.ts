import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = await params;
    // Users can only access their own data
    if (authUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authUserId}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("User not found", { status: 404 });
      }
      throw new Error("Failed to fetch user");
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = await params;
    // Users can only update their own data
    if (authUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authUserId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
