import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return new NextResponse(error, { status: response.status });
    }

    const listing = await response.json();
    return NextResponse.json(listing);
  } catch (error) {
    console.error("[LISTINGS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const url = query
      ? `${process.env.BACKEND_URL}/api/listings?${query}`
      : `${process.env.BACKEND_URL}/api/listings`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch listings", {
        status: response.status,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[LISTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
