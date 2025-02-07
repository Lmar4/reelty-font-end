import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/prisma-types";

interface ListingCardProps {
  listing: Listing;
  isLoading?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isLoading,
}) => {
  const mainPhoto = listing?.photos?.[0];

  if (isLoading) {
    return (
      <div className='animate-pulse'>
        <div className='relative rounded-2xl overflow-hidden mb-4 bg-gray-200 aspect-[4/3]' />
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 w-full'>
            <div className='h-6 bg-gray-200 rounded w-3/4' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href={`/dashboard/${listing.id}`} className='block'>
        <div className='relative rounded-2xl overflow-hidden mb-4 group'>
          <Image
            src={mainPhoto?.filePath || "/placeholder.jpg"}
            alt={listing.address}
            width={800}
            height={600}
            className='w-full aspect-[4/3] object-cover'
          />
          <button
            className='absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center hover:bg-white/90 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100'
            aria-label={`View details for ${listing.address}`}
            tabIndex={0}
            onClick={() => console.log(`Viewing ${listing.address}`)}
            onKeyDown={(e) =>
              e.key === "Enter" && console.log(`Viewing ${listing.address}`)
            }
          >
            <svg
              width='16'
              height='16'
              className='md:hidden'
              viewBox='0 0 24 24'
              fill='none'
              stroke='black'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='1' />
              <circle cx='12' cy='5' r='1' />
              <circle cx='12' cy='19' r='1' />
            </svg>
            <svg
              width='20'
              height='20'
              className='hidden md:block'
              viewBox='0 0 24 24'
              fill='none'
              stroke='black'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='1' />
              <circle cx='12' cy='5' r='1' />
              <circle cx='12' cy='19' r='1' />
            </svg>
          </button>
        </div>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h3 className='text-[14px] md:text-[18px] font-bold text-[#1c1c1c] leading-tight truncate'>
              {listing.address}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
};
