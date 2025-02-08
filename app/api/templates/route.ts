import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");

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
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch templates from backend");
    }

    const templates = await response.json();

    // Only return active templates
    const activeTemplates = templates.filter(
      (template: any) => template.isActive
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
