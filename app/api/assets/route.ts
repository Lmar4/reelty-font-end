import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const tier = searchParams.get("tier");

    if (!type || !tier) {
      return NextResponse.json(
        { error: "Asset type and subscription tier are required" },
        { status: 400 }
      );
    }

    // Fetch assets from backend
    const response = await fetch(
      `${process.env.REELTY_BACKEND_URL}/api/assets?type=${type}&tier=${tier}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch assets from backend");
    }

    const assets = await response.json();

    // Only return active assets
    const activeAssets = assets.filter((asset: any) => asset.isActive);

    return NextResponse.json(activeAssets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
