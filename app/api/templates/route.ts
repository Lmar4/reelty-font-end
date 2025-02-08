import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface Template {
  id: string;
  isActive: boolean;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract search parameters from request URL
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
        // Return default template if backend fails
        return NextResponse.json([
          {
            id: "default",
            name: "Default Template",
            description: "Default video template",
            sequence: ["intro", "photos", "outro"],
            durations: { intro: 3, photo: 3, outro: 3 },
            subscriptionTier: tier,
            isActive: true,
          },
        ]);
      }

      const templates = await response.json();

      if (!Array.isArray(templates)) {
        console.error("Templates response is not an array:", templates);
        return NextResponse.json(
          { error: "Invalid templates response from backend" },
          { status: 500 }
        );
      }

      // Filter and return active templates
      const activeTemplates = templates.filter(
        (template: Template) => template.isActive
      );

      // If no active templates, return default template
      if (activeTemplates.length === 0) {
        return NextResponse.json([
          {
            id: "default",
            name: "Default Template",
            description: "Default video template",
            sequence: ["intro", "photos", "outro"],
            durations: { intro: 3, photo: 3, outro: 3 },
            subscriptionTier: tier,
            isActive: true,
          },
        ]);
      }

      return NextResponse.json(activeTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      // Return default template on error
      return NextResponse.json([
        {
          id: "default",
          name: "Default Template",
          description: "Default video template",
          sequence: ["intro", "photos", "outro"],
          durations: { intro: 3, photo: 3, outro: 3 },
          subscriptionTier: tier,
          isActive: true,
        },
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
