import { NextResponse } from "next/server";
import { makeBackendRequest } from "@/utils/withAuth";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const sessionToken = request.headers.get("sessionToken");

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call backend API to ensure user has a tier
    const response = (await makeBackendRequest("/subscription/ensure-tier", {
      method: "POST",
      body: JSON.stringify({ userId }),
      sessionToken,
    })) as Response;

    if (!response.ok) {
      // Return default free tier if backend request fails
      return NextResponse.json({
        tier: {
          maxActiveListings: 1,
          name: "Free Trial",
          currentCount: 0,
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error ensuring user tier:", error);
    // Return default free tier on error
    return NextResponse.json({
      tier: {
        maxActiveListings: 1,
        name: "Free Trial",
        currentCount: 0,
      },
    });
  }
}
