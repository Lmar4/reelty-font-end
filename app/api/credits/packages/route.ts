import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch credit packages from backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/credits/packages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch credit packages from backend");
    }

    const packages = await response.json();
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching credit packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit packages" },
      { status: 500 }
    );
  }
}
