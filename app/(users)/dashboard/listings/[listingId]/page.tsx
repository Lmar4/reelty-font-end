import type { Listing } from "@/types/prisma-types";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ListingClient } from "./ListingClient";
import TempListingWrapper from "./TempListingWrapper";

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

  const response = await fetch(url, {
    headers,
    next: {
      revalidate: 60,
      tags: [`listing-${listingId}`],
    },
  });

  return handleApiResponse<Listing>(response, "Failed to fetch listing");
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
  const isTemp = resolvedSearchParams.temp === "true";

  // For temp listings, render the modal wrapper
  if (isTemp) {
    return <TempListingWrapper listingId={listingId} />;
  }

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
      return <TempListingWrapper listingId={listingId} />;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw error;
  }
}
