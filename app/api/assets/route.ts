import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Asset } from "@/types/prisma-types";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
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
});
