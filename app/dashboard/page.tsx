"use client";

import DashboardLayout from "@/components/reelty/DashboardLayout";
import FileUpload from "@/components/reelty/FileUpload";
import { ListingCard } from "@/components/reelty/ListingCard";
import NewListingModal from "@/components/reelty/NewListingModal";
import { useUserData } from "@/hooks/useUserData";
import { trpc } from "@/lib/trpc";
import type { ListingOutput, RouterOutput } from "@/types/trpc";
import Link from "next/link";
import { useEffect, useState } from "react";

type Property = RouterOutput["property"]["getUserListings"][number];

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { data: listings, isLoading: isListingsLoading } =
    trpc.property.getUserListings.useQuery(
      { userId: userData?.id || "" },
      { enabled: !!userData?.id }
    );

  const isLoading = isUserLoading || isListingsLoading;

  useEffect(() => {
    // Check if we're in the process of creating a listing
    const pendingSessionId = localStorage.getItem("pendingListingSession");
    setIsCreatingListing(!!pendingSessionId);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
  };



  return (
    <DashboardLayout>
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
        <div className='mb-8'>
          <FileUpload
            buttonText='Create new listing Reels'
            onFilesSelected={handleFilesSelected}
          />
        </div>

        {/* New Listing Modal */}
        <NewListingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialFiles={selectedFiles}
        />

        {/* Empty State */}
        {/* <div className="mb-24">
            <div className="bg-[#EDEDED] rounded-lg p-4 text-left">
              <p className="text-[15px] text-[#1c1c1c]">Create your first Reelty!</p>
              <p className="text-[14px] text-[#1c1c1c]/60">You have not created any listing Reels yet.</p>
            </div>
          </div> */}

        {/* Empty State */}
        {listings?.length === 0 && !isLoading && !isCreatingListing && (
          <div className='mb-24'>
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
        {(isLoading || isCreatingListing) && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(isCreatingListing ? 1 : 3)].map((_, i) => (
              <ListingCard
                key={`loading-${i}`}
                listing={{} as Property}
                isLoading={true}
              />
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {listings && listings.length > 0 && !isLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
