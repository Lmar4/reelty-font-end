import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/activity`,
      {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return new NextResponse("Forbidden", { status: 403 });
      }
      throw new Error("Failed to fetch activity");
    }

    const activities = await response.json();
    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
