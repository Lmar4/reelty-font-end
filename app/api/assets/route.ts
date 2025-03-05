import { Asset } from "@/types/prisma-types";
import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function getAssets(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const tier = searchParams.get("tier");

    if (!type || !tier) {
      return new NextResponse("Asset type and subscription tier are required", {
        status: 400,
      });
    }

    const assets = await makeBackendRequest<Asset[]>(
      `/api/assets?type=${type}&tier=${tier}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    // Only return active assets
    const activeAssets = assets.filter((asset) => asset.isActive);

    return NextResponse.json(activeAssets);
  } catch (error) {
    console.error("[ASSETS_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch assets",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getAssets);
  return authHandler(req);
}
