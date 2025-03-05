import { Asset } from "@/types/prisma-types";
import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler functions
async function getAsset(
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
}

async function updateAsset(
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
}

async function deleteAsset(
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
}

// Next.js App Router handlers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  const authHandler = await withAuthServer(getAsset);
  return authHandler(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  const authHandler = await withAuthServer(updateAsset);
  return authHandler(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  const authHandler = await withAuthServer(deleteAsset);
  return authHandler(req, context);
}
