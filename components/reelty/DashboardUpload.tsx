"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import NewListingModal from "./NewListingModal";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useUserData } from "@/hooks/useUserData";
import PricingCards from "./PricingCards";

interface FileData {
  data: string;
  name: string;
  type: string;
}

interface DashboardUploadProps {
  onFilesSelected?: (files: File[]) => Promise<void>;
}

export function DashboardUpload({ onFilesSelected }: DashboardUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { userId } = useAuth();
  const { data } = useUserData();

  // Calculate total remaining credits from the first listing credit record
  const totalCreditsRemaining =
    data?.listingCredits?.[0]?.creditsRemaining ?? 0;

  // User has reached limit if they have no credits remaining
  const hasReachedLimit = totalCreditsRemaining <= 0;

  // Check for stored listing data and pending files on mount
  useEffect(() => {
    if (!userId) return;

    // Check for pending files from homepage
    const pendingSession = localStorage.getItem("pendingListingSession");
    if (!pendingSession) return;

    const pendingFiles = localStorage.getItem(`pendingFiles_${pendingSession}`);
    if (!pendingFiles) return;

    try {
      const { files } = JSON.parse(pendingFiles) as { files: FileData[] };

      // Convert base64 back to File objects
      Promise.all(
        files.map(async (fileData) => {
          const response = await fetch(fileData.data);
          const blob = await response.blob();
          return new File([blob], fileData.name, { type: fileData.type });
        })
      ).then((convertedFiles) => {
        setSelectedFiles(convertedFiles);
        setIsModalOpen(true);

        // Clean up localStorage
        localStorage.removeItem(`pendingFiles_${pendingSession}`);
        localStorage.removeItem("pendingListingSession");
      });
    } catch (error) {
      console.error("Error restoring pending files:", error);
      // Clean up on error
      localStorage.removeItem(`pendingFiles_${pendingSession}`);
      localStorage.removeItem("pendingListingSession");
    }
  }, [userId]);

  const handleFilesSelected = async (files: File[]) => {
    // Check listing limit first
    if (hasReachedLimit) {
      setShowPricingModal(true);
      return;
    }

    // Validate files first
    if (files.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    // Cap display limit to 60 photos
    const selectedFiles = files.slice(0, 60);
    if (files.length > 60) {
      toast.info(`Showing the first 60 photos out of ${files.length} uploaded`);
    }

    // Check file types
    const invalidFiles = selectedFiles.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    // Check file sizes (max 20MB each)
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 20 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast.error(
        "Some files are larger than 20MB. Please select smaller files."
      );
      return;
    }

    if (onFilesSelected) {
      await onFilesSelected(selectedFiles);
    } else {
      setSelectedFiles(selectedFiles);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
    // Clean up localStorage
    localStorage.removeItem("pendingListingSession");
    const pendingSession = localStorage.getItem("pendingListingSession");
    if (pendingSession) {
      localStorage.removeItem(`pendingFiles_${pendingSession}`);
    }
  };

  if (showPricingModal) {
    return (
      <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-center'>
              Upgrade Your Plan
            </h2>
            <p className='text-gray-600 text-center mt-2'>
              You've reached the limit of{" "}
              {data?.currentTier?.maxActiveListings ?? 0} active listings on
              your {data?.currentTier?.name ?? "current"}
              plan. Upgrade to create more listings!
            </p>
          </div>
          <PricingCards
            isModal={true}
            currentTier={data?.currentTier?.id}
            currentStatus={data?.subscriptionStatus}
            onUpgradeComplete={() => {
              setShowPricingModal(false);
            }}
          />
          <button
            onClick={() => setShowPricingModal(false)}
            className='mt-6 w-full text-gray-600 hover:text-gray-800'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FileUpload
        buttonText={
          hasReachedLimit
            ? "Upgrade to create more listings"
            : "Create new listing Reels"
        }
        onFilesSelected={handleFilesSelected}
        uploadUrl=''
        maxFiles={60}
        maxSize={20}
        accept='image/*'
        disabled={hasReachedLimit}
      />

      <NewListingModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialFiles={selectedFiles}
      />
    </>
  );
}
