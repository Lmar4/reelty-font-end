import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { assetId } = await params;
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/assets/${assetId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update asset");
    }

    const asset = await response.json();
    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ASSET_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { assetId } = await params;
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/assets/${assetId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete asset");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ASSET_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
