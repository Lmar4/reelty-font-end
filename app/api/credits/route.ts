import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch credits from backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/credits/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch credits from backend");
    }

    const { creditsRemaining } = await response.json();
    return NextResponse.json(creditsRemaining);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
