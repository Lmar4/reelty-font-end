"use client";

import { useState } from "react";

import { DashboardUpload } from "@/components/reelty/DashboardUpload";
import { LoadingState } from "@/components/ui/loading-state";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useListings } from "@/hooks/queries/use-listings";
import { useUser as useClerkUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NewListingModal from "@/components/reelty/NewListingModal";

export default function DashboardPage() {
  const { user: clerkUser } = useClerkUser();

  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: listings, isLoading: isListingsLoading } = useListings(
    clerkUser?.id || ""
  );

  const handleFilesSelected = async (files: File[]) => {
    setSelectedFiles(files);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className='mt-8 mb-0'>
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
      <DashboardUpload onFilesSelected={handleFilesSelected} />

      {/* Empty State */}
      {listings?.length === 0 && !isListingsLoading && (
        <div className='mb-8 md:mb-24 mt-4'>
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
      {listings && listings.length > 0 && <ListingGrid listings={listings} />}
      {isModalOpen && (
        <NewListingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFiles([]);
            router.refresh();
          }}
          initialFiles={selectedFiles}
        />
      )}
    </>
  );
}
