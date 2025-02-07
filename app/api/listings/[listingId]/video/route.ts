import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await params;

    // Fetch video details from backend
    const response = await fetch(
      `${process.env.REELTY_BACKEND_URL}/api/listings/${listingId}/video`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REELTY_BACKEND_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video details from backend");
    }

    const videoDetails = await response.json();
    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error("Error fetching video details:", error);
    return NextResponse.json(
      { error: "Failed to fetch video details" },
      { status: 500 }
    );
  }
}
