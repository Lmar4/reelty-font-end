"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import FileUpload from "@/components/reelty/FileUpload";
import NewListingModal from "@/components/reelty/NewListingModal";
import { useUserData } from "@/hooks/useUserData";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { data: listings, isLoading: isListingsLoading } =
    trpc.users.listings.useQuery(
      { userId: userData?.id || "" },
      { enabled: !!userData?.id }
    );

  const isLoading = isUserLoading || isListingsLoading;

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
        {listings?.length === 0 && !isLoading && (
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
        {isLoading && (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black'></div>
          </div>
        )}

        {/* Listings Grid */}
        {listings && listings.length > 0 && (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            {listings.map((listing) => (
              <div key={listing.id}>
                <Link href={`/dashboard/${listing.id}`} className='block'>
                  <div className='relative rounded-2xl overflow-hidden mb-4 group'>
                    <Image
                      src={listing.thumbnailUrl || "/images/placeholder.jpg"}
                      alt={listing.address}
                      width={800}
                      height={600}
                      className='w-full aspect-[4/3] object-cover'
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsModalOpen(true);
                      }}
                      className='absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center hover:bg-white/90 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100'
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
                      <p className='text-[13px] text-[#1c1c1c]/60 mt-1'>
                        {listing.status === "processing"
                          ? "Processing..."
                          : "Ready"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
