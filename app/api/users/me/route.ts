import { auth } from "@clerk/nextjs/server";
import { makeBackendRequest } from "@/utils/withAuth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, sessionId, getToken } = await auth();
    const token = await getToken(); // Remove template for now

    if (!token || !userId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing authentication credentials",
        },
        { status: 401 }
      );
    }

    // Pass the userId in the request headers
    const userData = await makeBackendRequest(`/users/${userId}`, {
      method: "GET",
      sessionToken: token,
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("[USER_ME_GET] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}
