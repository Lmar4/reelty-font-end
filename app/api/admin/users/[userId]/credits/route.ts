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

    const { adjustment } = await request.json();
    if (typeof adjustment !== "number") {
      return new NextResponse("Invalid credit adjustment", { status: 400 });
    }

    const { userId } = await params;

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/users/${userId}/credits`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminId}`,
        },
        body: JSON.stringify({ adjustment }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to adjust credits");
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[CREDITS_ADJUST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
