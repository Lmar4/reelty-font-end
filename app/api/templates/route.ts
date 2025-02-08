import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface Template {
  id: string;
  isActive: boolean;
  [key: string]: any;
}

export async function GET(
  request: Request,
  {
    searchParams,
  }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await searchParams;
    const tier = resolvedParams.tier as string;

    if (!tier) {
      return NextResponse.json(
        { error: "Subscription tier is required" },
        { status: 400 }
      );
    }

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
      throw new Error("Failed to fetch templates from backend");
    }

    const templates = await response.json();

    // Ensure templates is an array
    if (!Array.isArray(templates)) {
      console.error("Templates response is not an array:", templates);
      return NextResponse.json(
        { error: "Invalid templates response from backend" },
        { status: 500 }
      );
    }

    // Only return active templates
    const activeTemplates = templates.filter(
      (template: Template) => template.isActive
    );

    return NextResponse.json(activeTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
