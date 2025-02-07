"use client";

import DashboardLayout from "@/components/reelty/DashboardLayout";
import FileUpload from "@/components/reelty/FileUpload";
import { ListingCard } from "@/components/reelty/ListingCard";
import NewListingModal from "@/components/reelty/NewListingModal";
import { useUserData } from "@/hooks/useUserData";
import { useListings } from "@/hooks/queries/use-listings";
import { Listing } from "@/types/prisma-types";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { data: listings, isLoading: isListingsLoading } = useListings(userData?.id || "");

  const isLoading = isUserLoading || isListingsLoading;

  useEffect(() => {
    // Check for pending listing session
    const pendingSessionId = localStorage.getItem("pendingListingSession");
    if (pendingSessionId) {
      const pendingFilesData = localStorage.getItem(`pendingFiles_${pendingSessionId}`);
      if (pendingFilesData) {
        try {
          const { files, timestamp } = JSON.parse(pendingFilesData);
          // Only process if the session is less than 1 hour old
          if (Date.now() - timestamp < 3600000) {
            setIsCreatingListing(true);
            setIsModalOpen(true);
            
            // Reconstruct File objects from the stored data
            const reconstructedFiles = files.map((fileData: any) => {
              // Convert base64 to blob
              const [metadata, base64Data] = (fileData.data as string).split(',');
              const byteString = atob(base64Data);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              
              const blob = new Blob([ab], { type: fileData.type });
              return new File([blob], fileData.name, { type: fileData.type });
            });
            
            setSelectedFiles(reconstructedFiles);
          }
        } catch (error) {
          console.error("Error processing pending files:", error);
        }
      }
      // Clean up the pending session
      localStorage.removeItem("pendingListingSession");
      localStorage.removeItem(`pendingFiles_${pendingSessionId}`);
    }
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
    setIsCreatingListing(false);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        {/* Header Section */}
        <motion.div 
          className='mb-0'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href='/dashboard'
            className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 mb-2 block'
          >
            Dashboard
          </Link>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-4 md:mb-8'>
            Your Listings
          </h1>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          className='mb-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FileUpload
            buttonText='Create new listing Reels'
            onFilesSelected={handleFilesSelected}
          />
        </motion.div>

        {/* New Listing Modal */}
        <NewListingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialFiles={selectedFiles}
        />

        {/* Empty State */}
        {listings?.length === 0 && !isLoading && !isCreatingListing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <EmptyState
              icon={PlusCircle}
              title="Create your first Reelty!"
              description="You have not created any listing Reels yet. Get started by creating your first one."
              action={{
                label: "Create Listing",
                onClick: () => document.querySelector<HTMLElement>('[data-testid="file-upload-button"]')?.click()
              }}
              className="mb-24"
            />
          </motion.div>
        )}

        {/* Loading State */}
        {(isLoading || isCreatingListing) && (
          <LoadingState 
            text={isCreatingListing ? "Creating your listing..." : "Loading your listings..."}
            size="lg"
          />
        )}

        {/* Listings Grid */}
        {listings && listings.length > 0 && !isLoading && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          >
            {listings.map((listing) => (
              <motion.div key={listing.id} variants={item}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
