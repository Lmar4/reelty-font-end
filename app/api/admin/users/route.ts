import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const minCredits = searchParams.get("minCredits");
    const maxCredits = searchParams.get("maxCredits");
    const search = searchParams.get("search");

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (tier) queryParams.set("tier", tier);
    if (status) queryParams.set("status", status);
    if (minCredits) queryParams.set("minCredits", minCredits);
    if (maxCredits) queryParams.set("maxCredits", maxCredits);
    if (search) queryParams.set("search", search);

    // Call backend API
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/admin/users?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
