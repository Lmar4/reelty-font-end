import { NextResponse } from "next/server";

import { Asset } from "@/types/prisma-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuth } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
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
});

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
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
});
