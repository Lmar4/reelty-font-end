import { ListingClient } from "./ListingClient";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Listing, VideoJob } from "@/types/prisma-types";

interface PageProps {
  params: {
    listingId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Utility function to handle API responses
async function handleApiResponse<T>(
  response: Response,
  errorMessage: string
): Promise<T> {
  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// Utility function to get auth headers
async function getAuthHeaders() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return {
    Authorization: `Bearer ${userId}`,
  };
}

async function getListing(listingId: string): Promise<Listing> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/listings/${listingId}`,
    {
      headers,
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );
  return handleApiResponse<Listing>(response, "Failed to fetch listing");
}

async function getListingJobs(listingId: string): Promise<VideoJob[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/jobs?listingId=${listingId}`,
    {
      headers,
      next: { revalidate: 30 }, // Cache for 30 seconds
    }
  );
  return handleApiResponse<VideoJob[]>(
    response,
    "Failed to fetch listing jobs"
  );
}

export default async function ListingPage({ params, searchParams }: PageProps) {
  try {
    const [listing, jobs] = await Promise.all([
      getListing(params.listingId),
      getListingJobs(params.listingId),
    ]);

    return (
      <ListingClient
        params={params}
        searchParams={searchParams}
        initialListing={listing}
        initialJobs={jobs}
      />
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      // Handle unauthorized error appropriately
      throw error;
    }
    // Let Next.js error boundary handle other errors
    throw error;
  }
}
