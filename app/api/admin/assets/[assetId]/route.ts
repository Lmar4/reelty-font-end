import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Asset } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    const asset = await makeBackendRequest<Asset>(
      `/api/admin/assets/${assetId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
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

export const GET = withAuthServer(async function PATCH(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const body = await request.json();

    const asset = await makeBackendRequest<Asset>(
      `/api/admin/assets/${assetId}`,
      {
        method: "PATCH",
        sessionToken: req.auth.sessionToken,
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

export const GET = withAuthServer(async function DELETE(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    await makeBackendRequest(`/api/admin/assets/${assetId}`, {
      method: "DELETE",
      sessionToken: req.auth.sessionToken,
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
