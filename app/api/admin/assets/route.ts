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
    const type = searchParams.get("type") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const assets = await makeBackendRequest<Asset[]>("/api/admin/assets", {
      method: "GET",
      sessionToken: request.auth.sessionToken,
      headers: {
        ...(type && { "X-Asset-Type": type }),
        ...(includeInactive && { "X-Include-Inactive": "true" }),
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("[ASSETS_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch assets",
      { status: 500 }
    );
  }
});

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const body = await request.json();
    const asset = await makeBackendRequest<Asset>("/api/admin/assets", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ASSETS_POST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create asset",
      { status: 500 }
    );
  }
});
