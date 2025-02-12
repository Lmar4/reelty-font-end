import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Template, User } from "@/types/prisma-types";

const DEFAULT_TEMPLATE: Template = {
  thumbnailUrl: null,
  id: "default",
  name: "Default Template",
  description: "Default video template",
  tiers: ["free", "pro", "enterprise"],
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    // Get user data to get their current tier ID
    const user = await makeBackendRequest<{ success: boolean; data: User }>(
      `/api/users/${request.auth.userId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
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
        sessionToken: request.auth.sessionToken,
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
