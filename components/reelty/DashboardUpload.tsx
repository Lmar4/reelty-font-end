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
  const { data: userData } = useUserData();
  console.log("userData", userData);
  const hasReachedLimit =
    (userData?.listings?.length ?? 0) >=
    (userData?.currentTier?.maxActiveListings ?? 0);

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
    // TODO: you can only select 20 photos but you can upload more photos
    // Take first 10 files if more are selected
    const selectedFiles = files.slice(0, 10);
    if (files.length > 10) {
      toast.info(
        `Selected the first 10 photos out of ${files.length} uploaded`
      );
    }

    // Check file types
    const invalidFiles = selectedFiles.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    // Check file sizes (max 15MB each)
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 15 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast.error(
        "Some files are larger than 15MB. Please select smaller files."
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
              {userData?.currentTier?.maxActiveListings ?? 0} active listings on
              your {userData?.currentTier?.name ?? "current"} plan. Upgrade to
              create more listings!
            </p>
          </div>
          <PricingCards
            isModal={true}
            currentTier={userData?.currentTier?.id}
            currentStatus={userData?.subscriptionStatus}
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
        maxFiles={10}
        maxSize={15}
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
