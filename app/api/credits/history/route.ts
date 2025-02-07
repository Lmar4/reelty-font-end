import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call backend to get credit history
    const response = await fetch(
      `${process.env.REELTY_BACKEND_URL}/api/credits/history/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch credit history");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_HISTORY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch credit history" },
      { status: 500 }
    );
  }
}
