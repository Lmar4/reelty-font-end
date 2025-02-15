import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { Asset } from "@/types/prisma-types";

export const GET = withAuth(async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    const asset = await makeBackendRequest<Asset>(
      `/api/admin/assets/${assetId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ADMIN_ASSET_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch asset",
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const body = await request.json();

    const asset = await makeBackendRequest<Asset>(
      `/api/admin/assets/${assetId}`,
      {
        method: "PATCH",
        sessionToken: request.auth.sessionToken,
        body: body,
      }
    );

    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ADMIN_ASSET_PATCH]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update asset",
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    await makeBackendRequest(`/api/admin/assets/${assetId}`, {
      method: "DELETE",
      sessionToken: request.auth.sessionToken,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ADMIN_ASSET_DELETE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to delete asset",
      { status: 500 }
    );
  }
});
