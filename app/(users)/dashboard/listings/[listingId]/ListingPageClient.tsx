"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { useListing } from "@/hooks/queries/use-listings";
import { notFound } from "next/navigation";
import { ListingClient } from "./ListingClient";

interface ListingPageClientProps {
  listingId: string;
}

export default function ListingPageClient({
  listingId,
}: ListingPageClientProps) {
  const { data: listing, isLoading, error } = useListing(listingId);

  if (isLoading) {
    return (
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <LoadingState />
      </div>
    );
  }

  if (error || !listing) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    return (
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <div className='text-center'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Failed to load listing
          </h2>
          <p className='mt-1 text-sm text-gray-500'>
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-4 p-8 pt-6'>
      <ListingClient
        listingId={listingId}
        initialListing={listing}
        searchParams={{}}
      />
    </div>
  );
}
