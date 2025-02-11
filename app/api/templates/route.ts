import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

interface Template {
  id: string;
  name: string;
  description: string;
  sequence: any[];
  durations: Record<string, number>;
  musicPath?: string;
  musicVolume?: number;
  subscriptionTier: string;
  isActive: boolean;
}

const DEFAULT_TEMPLATE = {
  id: "default",
  name: "Default Template",
  description: "Default video template",
  sequence: ["intro", "photos", "outro"],
  durations: { intro: 3, photo: 3, outro: 3 },
  isActive: true,
};

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get("tierId");

    if (!tierId) {
      return new NextResponse("Subscription tier is required", { status: 400 });
    }

    try {
      const templates = await makeBackendRequest<Template[]>(
        `/api/templates?tierId=${tierId}`,
        {
          method: "GET",
          sessionToken: request.auth.sessionToken,
        }
      );

      // Filter active templates
      const activeTemplates = templates.filter((template) => template.isActive);

      // If no active templates, return default template
      if (activeTemplates.length === 0) {
        return NextResponse.json([
          { ...DEFAULT_TEMPLATE, subscriptionTier: tierId },
        ]);
      }

      return NextResponse.json(activeTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json([
        { ...DEFAULT_TEMPLATE, subscriptionTier: tierId },
      ]);
    }
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch templates",
      { status: 500 }
    );
  }
});
