import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/analytics/credits`,
      {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch credit analytics");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CREDIT_ANALYTICS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
