import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Listing } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  request: AuthenticatedRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const url = query ? `/api/listings?${query}` : "/api/listings";

    const listings = await makeBackendRequest<Listing[]>(url, {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("[LISTINGS_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch listings",
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
    console.log("[LISTINGS_POST] Content-Type:", contentType);

    let body;
    let isFormData = false;

    if (contentType?.includes("multipart/form-data")) {
      return new NextResponse("Please use JSON for creating listings", {
        status: 400,
      });
    } else {
      // Handle JSON
      body = await request.json();
      console.log("[LISTINGS_POST] JSON body:", body);

      // Validate required fields for JSON requests
      if (!body.address) {
        return new NextResponse("Missing required field: address", {
          status: 400,
        });
      }
    }

    // Forward the request to the backend
    const headers: HeadersInit = {
      Authorization: `Bearer ${request.auth.sessionToken}`,
      "Content-Type": "application/json",
    };

    // For JSON requests, validate and transform the data
    if (!isFormData) {
      // Ensure coordinates are properly formatted numbers if they exist
      if (body.coordinates) {
        body.coordinates = {
          lat:
            typeof body.coordinates.lat === "string"
              ? parseFloat(body.coordinates.lat)
              : body.coordinates.lat,
          lng:
            typeof body.coordinates.lng === "string"
              ? parseFloat(body.coordinates.lng)
              : body.coordinates.lng,
        };

        // Validate coordinates are valid numbers
        if (isNaN(body.coordinates.lat) || isNaN(body.coordinates.lng)) {
          return new NextResponse("Invalid coordinates format", {
            status: 400,
          });
        }
      }

      // Transform the body to match the backend schema
      const transformedBody = {
        userId: request.auth.userId,
        address: body.address,
        coordinates: body.coordinates,
        photoLimit: body.photoLimit || 10,
        description: body.description || "",
      };
      body = transformedBody;
    }

    const response = await fetch(`${backendUrl}/api/listings`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return new NextResponse(errorJson.error || "Failed to create listing", {
          status: response.status,
        });
      } catch {
        return new NextResponse(errorText || response.statusText, {
          status: response.status,
        });
      }
    }

    const responseData = await response.json();
    return NextResponse.json(responseData.data);
  } catch (error) {
    console.error("[LISTINGS_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create listing",
      { status: 500 }
    );
  }
});
