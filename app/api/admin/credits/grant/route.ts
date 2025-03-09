import { NextRequest, NextResponse } from "next/server";

// Handler function for granting credits
async function grantCredits(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, reason, adminId } = body;

    // Validate required fields
    if (!userId || !amount || !reason || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call backend API to grant credits
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/credits/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          reason,
          adminId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to grant credits" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error granting credits:", error);
    return NextResponse.json(
      { error: "Failed to grant credits" },
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  // In a real app, you would implement admin authentication
  // For now, we'll just call the handler directly
  return grantCredits(req);
}
