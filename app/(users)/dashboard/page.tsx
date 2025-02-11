"use client";

import { DashboardUpload } from "@/components/reelty/DashboardUpload";
import { LoadingState } from "@/components/ui/loading-state";
import { useListings } from "@/hooks/queries/use-listings";
import { getBaseS3Url } from "@/utils/s3-url";
import { useUser as useClerkUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { user: clerkUser } = useClerkUser();

  const { data: listings, isLoading: isListingsLoading } = useListings(
    clerkUser?.id || ""
  );

  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
      {/* Header Section */}
      <div className='mb-0'>
        <Link
          href='/dashboard'
          className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 mb-2 block'
        >
          Dashboard
        </Link>
        <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-4 md:mb-8'>
          Your Listings
        </h1>
      </div>

      {/* Input Section */}
      <DashboardUpload />

      {/* Empty State */}
      {listings?.length === 0 && !isListingsLoading && (
        <div className='mb-24 mt-4'>
          <div className='bg-[#EDEDED] rounded-lg p-4 text-left'>
            <p className='text-[15px] text-[#1c1c1c]'>
              Create your first Reelty!
            </p>
            <p className='text-[14px] text-[#1c1c1c]/60'>
              You have not created any listing Reels yet.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isListingsLoading && (
        <div className='flex items-center justify-center py-12'>
          <LoadingState size='lg' />
        </div>
      )}

      {/* Listings Grid */}
      {listings && listings.length > 0 && (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 mt-8'>
          {listings.map((listing) => (
            <div key={listing.id}>
              <Link
                href={`/dashboard/listings/${listing.id}`}
                className='block group'
              >
                <div className='relative rounded-2xl overflow-hidden mb-4'>
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
                  <button
                    className='absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center hover:bg-white/90 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100'
                    aria-label='Listing options'
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
          ))}
        </div>
      )}
    </div>
  );
}
