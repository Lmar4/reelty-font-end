import type { Listing } from "@/types/prisma-types";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ListingClient } from "./ListingClient";

// Utility function to handle API responses
async function handleApiResponse<T>(
  response: Response,
  errorMessage: string
): Promise<T> {
  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    const errorText = await response.text();
    throw new Error(errorMessage);
  }
  return response.json();
}

// Utility function to get auth headers
async function getAuthHeaders() {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const token = await session.getToken();
  if (!token) {
    throw new Error("No valid session token");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function getListing(listingId: string): Promise<Listing> {
  const headers = await getAuthHeaders();
  const url = `${process.env.BACKEND_URL}/api/listings/${listingId}`;

  // Add cache options for better performance
  const options = {
    headers,
    next: {
      revalidate: 60, // Cache for 1 minute
      tags: [`listing-${listingId}`], // Add cache tag for targeted revalidation
    },
  };

  const response = await fetch(url, options);

  const result = await handleApiResponse<{
    success: boolean;
    data: Listing & {
      photos: Array<{
        id: string;
        filePath: string;
        processedFilePath: string | null;
        order: number;
      }>;
    };
  }>(response, "Failed to fetch listing");

  // Sort photos by order
  if (result.data.photos) {
    result.data.photos.sort((a, b) => a.order - b.order);
  }

  return result.data;
}



export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { listingId } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const listing = await getListing(listingId).catch((error) => {
      console.error("Error fetching listing:", error);
      throw error;
    });

    return (
      <div>
        <ListingClient
          listingId={listingId}
          searchParams={resolvedSearchParams}
          initialListing={listing}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      throw error;
    }
    throw error;
  }
}
