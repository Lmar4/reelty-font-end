"use client";

import { AnimatePresence } from "framer-motion";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  listings: Array<{
    id: string;
    address: string;
    photos?: Array<{
      filePath: string;
      processedFilePath?: string | null;
    }>;
  }>;
}

export const ListingGrid = ({ listings }: ListingGridProps) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mt-4 md:mt-8'>
      <AnimatePresence mode='popLayout'>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </AnimatePresence>
    </div>
  );
};
