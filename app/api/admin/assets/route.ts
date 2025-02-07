import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/assets`,
      {
        headers: {
          Authorization: `Bearer ${userId}`,
          ...(type && { "X-Asset-Type": type }),
          ...(includeInactive && { "X-Include-Inactive": "true" }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch assets");
    }

    const assets = await response.json();
    return NextResponse.json(assets);
  } catch (error) {
    console.error("[ASSETS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/assets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create asset");
    }

    const asset = await response.json();
    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ASSETS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
