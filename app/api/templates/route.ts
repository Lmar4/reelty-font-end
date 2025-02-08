import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface Template {
  id: string;
  isActive: boolean;
  [key: string]: any;
}

interface BackendResponse {
  success: boolean;
  data?: Template[];
  error?: string;
}

const DEFAULT_TEMPLATE = {
  id: "default",
  name: "Default Template",
  description: "Default video template",
  sequence: ["intro", "photos", "outro"],
  durations: { intro: 3, photo: 3, outro: 3 },
  isActive: true,
};

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const tier = searchParams.get("tier");

    if (!tier) {
      return NextResponse.json(
        { error: "Subscription tier is required" },
        { status: 400 }
      );
    }

    try {
      // Fetch templates from backend
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/templates?tier=${tier}`,
        {
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Backend templates error:", await response.text());
        return NextResponse.json([
          { ...DEFAULT_TEMPLATE, subscriptionTier: tier },
        ]);
      }

      const backendResponse = (await response.json()) as BackendResponse;

      // Check if the response is successful and contains data
      if (!backendResponse.success || !backendResponse.data) {
        console.warn(
          "Invalid backend response or no templates found:",
          backendResponse
        );
        return NextResponse.json([
          { ...DEFAULT_TEMPLATE, subscriptionTier: tier },
        ]);
      }

      // Filter active templates (although backend should already do this)
      const activeTemplates = backendResponse.data.filter(
        (template: Template) => template.isActive
      );

      // If no active templates, return default template
      if (activeTemplates.length === 0) {
        return NextResponse.json([
          { ...DEFAULT_TEMPLATE, subscriptionTier: tier },
        ]);
      }

      return NextResponse.json(activeTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json([
        { ...DEFAULT_TEMPLATE, subscriptionTier: tier },
      ]);
    }
  } catch (error) {
    console.error("Error in templates route:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
