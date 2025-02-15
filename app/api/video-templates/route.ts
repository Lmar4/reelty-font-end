import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const response = await makeBackendRequest<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        description: string;
        thumbnailUrl: string | null;
        subscriptionTiers: Array<{
          name: string;
        }>;
      }>;
    }>("/api/templates", {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    if (!response.data) {
      return NextResponse.json([]);
    }

    // Map templates to include the correct ID format
    const templates = response.data.map((template) => ({
      id: template.name.toLowerCase().replace(/[\s-]+/g, ""),
      name: template.name,
      description: template.description,
      thumbnailUrl: template.thumbnailUrl,
      subscriptionTiers: template.subscriptionTiers,
    }));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[VIDEO_TEMPLATES_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch templates",
      { status: 500 }
    );
  }
});
