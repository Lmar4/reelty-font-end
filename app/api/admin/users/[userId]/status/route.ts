import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await request.json();
    if (!["active", "suspended", "inactive"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const { userId } = await params;

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/users/${userId}/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminId}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[STATUS_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
