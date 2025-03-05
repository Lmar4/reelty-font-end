import { Asset } from "@/types/prisma-types";
import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Handler functions
async function getAssets(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const assets = await makeBackendRequest<Asset[]>(
      "/api/admin/assets/assets",
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
        headers: {
          ...(type && { "X-Asset-Type": type }),
          ...(includeInactive && { "X-Include-Inactive": "true" }),
        },
      }
    );

    return NextResponse.json(assets);
  } catch (error) {
    console.error("[ASSETS_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      {
        status: 500,
      }
    );
  }
}

async function createAsset(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const asset = await makeBackendRequest<Asset>("/api/admin/assets/assets", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ASSETS_POST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      {
        status: 500,
      }
    );
  }
}

// Next.js App Router handlers
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getAssets);
  return authHandler(req);
}

export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(createAsset);
  return authHandler(req);
}
