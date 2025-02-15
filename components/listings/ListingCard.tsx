"use client";

import { getBaseS3Url } from "@/utils/s3-url";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ListingDropdown } from "./ListingDropdown";

interface ListingCardProps {
  listing: {
    id: string;
    address: string;
    photos?: Array<{
      filePath: string;
      processedFilePath?: string | null;
    }>;
  };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <div className='relative rounded-2xl overflow-hidden mb-3'>
        <Link
          href={`/dashboard/listings/${listing.id}`}
          className='block group'
        >
          {listing.photos?.[0] && (
            <Image
              src={getBaseS3Url(
                listing.photos[0].processedFilePath ||
                  listing.photos[0].filePath
              )}
              alt={listing.address || "Listing image"}
              width={800}
              height={600}
              className='w-full aspect-[4/3] object-cover'
            />
          )}
        </Link>
        <div className='absolute top-2 right-2'>
          <ListingDropdown listingId={listing.id} />
        </div>
      </div>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h3 className='text-[14px] font-bold text-[#1c1c1c] leading-tight truncate'>
            {listing.address}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};
