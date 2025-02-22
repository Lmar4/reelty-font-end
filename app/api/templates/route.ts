import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Template, User } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
  try {
    // Get user data to get their current tier ID
    const user = await makeBackendRequest<{ success: boolean; data: User }>(
      `/api/users/${req.auth.userId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    if (!user?.data?.currentTierId) {
      return new NextResponse("User subscription tier not found", {
        status: 400,
      });
    }

    try {
      const response = await makeBackendRequest<{
        success: boolean;
        data: Template[];
      }>(`/api/templates?tierId=${user.data.currentTierId}`, {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      });

      // If no templates, return empty array
      if (!response.data || response.data.length === 0) {
        return NextResponse.json([]);
      }

      return NextResponse.json(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch templates",
      { status: 500 }
    );
  }
});
