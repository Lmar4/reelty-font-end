import { ListingClient } from "./ListingClient";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    listingId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getListing(listingId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/listings/${listingId}`,
    {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch listing");
  }

  return response.json();
}

async function getListingJobs(listingId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/jobs?listingId=${listingId}`,
    {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch listing jobs");
  }

  return response.json();
}

export default async function ListingPage({ params, searchParams }: PageProps) {
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
}
