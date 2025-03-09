import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/utils/serverActions";

export async function GET() {
  try {
    // Use the server action to make an authenticated request to the backend
    const response = await fetchFromBackend(
      "/api/subscription/lifetime-availability"
    );

    if (!response.success) {
      return NextResponse.json(
        {
          error: response.error || "Failed to check lifetime plan availability",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error checking lifetime plan availability:", error);
    return NextResponse.json(
      { error: "Failed to check lifetime plan availability" },
      { status: 500 }
    );
  }
}
