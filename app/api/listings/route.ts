import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.address || !body.coordinates || !body.photoLimit) {
      return new NextResponse(
        "Missing required fields: address, coordinates, or photoLimit",
        { status: 400 }
      );
    }

    // Validate coordinates
    if (
      typeof body.coordinates.lat !== "number" ||
      typeof body.coordinates.lng !== "number"
    ) {
      return new NextResponse(
        "Invalid coordinates format. Expected numbers for lat and lng",
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log("Creating listing with body:", JSON.stringify(body, null, 2));

    const response = await fetch(`${process.env.BACKEND_URL}/api/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify({
        ...body,
        coordinates: {
          lat: Number(body.coordinates.lat),
          lng: Number(body.coordinates.lng),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return new NextResponse(
        `Backend error: ${errorText || response.statusText}`,
        { status: response.status }
      );
    }

    const backendResponse = (await response.json()) as BackendResponse<any>;

    if (!backendResponse.success || !backendResponse.data) {
      console.error("Invalid backend response:", backendResponse);
      return new NextResponse(
        `Invalid response from backend: ${
          backendResponse.error || "No data returned"
        }`,
        { status: 500 }
      );
    }

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("[LISTINGS_POST]", error);
    return new NextResponse(
      `Internal error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
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

    const backendResponse = (await response.json()) as BackendResponse<any[]>;

    if (!backendResponse.success || !backendResponse.data) {
      console.error("Invalid backend response:", backendResponse);
      return new NextResponse(
        `Invalid response from backend: ${
          backendResponse.error || "No data returned"
        }`,
        { status: 500 }
      );
    }

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("[LISTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
