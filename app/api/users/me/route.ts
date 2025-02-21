import { auth } from "@clerk/nextjs/server";
import { makeBackendRequest } from "@/utils/withAuth";
import { NextResponse } from "next/server";

// Add interface for the response type
interface UserResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    currentTier?: {
      id: string;
      name: string;
    };
  };
  error?: string;
}

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    const token = await getToken();

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await makeBackendRequest<UserResponse>(
      `/api/users/${userId}`,
      {
        sessionToken: token,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[USER_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
