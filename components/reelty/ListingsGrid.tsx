"use client";

import { motion } from "framer-motion";
import { ListingCard } from "./ListingCard";
import { PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useListings } from "@/hooks/queries/use-listings";
import { useUserData } from "@/hooks/useUserData";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function ListingsGrid() {
  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { data: listings, isLoading: isListingsLoading } = useListings(
    userData?.id || ""
  );

  const isLoading = isUserLoading || isListingsLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  if (listings?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <EmptyState
          icon={PlusCircle}
          title='Create your first Reelty!'
          description='You have not created any listing Reels yet. Get started by creating your first one.'
          action={{
            label: "Create Listing",
            onClick: () =>
              document
                .querySelector<HTMLElement>(
                  '[data-testid="file-upload-button"]'
                )
                ?.click(),
          }}
          className='mb-24'
        />
      </motion.div>
    );
  }

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    >
      {listings.map((listing) => (
        <motion.div key={listing.id} variants={item}>
          <ListingCard listing={listing} />
        </motion.div>
      ))}
    </motion.div>
  );
}
