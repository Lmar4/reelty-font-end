import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/stats/users`,
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
      throw new Error("Failed to fetch user stats");
    }

    const stats = await response.json();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[USER_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
