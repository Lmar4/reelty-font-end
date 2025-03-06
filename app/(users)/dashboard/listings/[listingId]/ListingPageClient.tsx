"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { useListing } from "@/hooks/queries/use-listings";
import { notFound } from "next/navigation";
import { ListingClient } from "./ListingClient";

interface ListingPageClientProps {
  listingId: string;
  fallbackTier: {
    maxActiveListings: number;
    name: string;
    currentCount: number;
  };
}

export default function ListingPageClient({
  listingId,
  fallbackTier,
}: ListingPageClientProps) {
  const { data: listing, isLoading, error } = useListing(listingId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isLoading && (error || !listing)) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    return (
      <div className='text-center'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Failed to load listing
        </h2>
        <p className='mt-1 text-sm text-gray-500'>
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );
  }

  return <ListingClient listingId={listingId} initialListing={listing!} />;
}
