import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest, ApiResponse } from "@/utils/withAuth";
import { Listing } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  request: AuthenticatedRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const url = query ? `/api/listings?${query}` : "/api/listings";

    const response = await makeBackendRequest<ApiResponse<Listing[]>>(url, {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch listings");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("[LISTINGS_GET]", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch listings",
        data: null,
      },
      { status: 500 }
    );
  }
});

export const POST = withAuthServer(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL not configured");
    }

    // Check content type to determine how to handle the body
    const contentType = request.headers.get("content-type");
    let body;

    try {
      // Handle JSON
      body = await request.json();

      // Validate required fields
      if (!body.address) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required field: address",
            data: null,
          },
          { status: 400 }
        );
      }

      // Transform the body to match the backend schema
      const transformedBody = {
        userId: request.auth.userId,
        address: body.address,
        coordinates: body.coordinates
          ? {
              lat: Number(body.coordinates.lat),
              lng: Number(body.coordinates.lng),
            }
          : null,
        photoLimit: body.photoLimit || 10,
        description: body.description || "",
        photos: body.photos || [],
      };

      const response = await fetch(`${backendUrl}/api/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.auth.sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: responseData.error || "Failed to create listing",
            data: null,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        error: null,
        data: responseData.data,
      });
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          data: null,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Listing creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        data: null,
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
});
