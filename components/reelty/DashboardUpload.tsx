"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import NewListingModal from "./NewListingModal";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export function DashboardUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const { userId } = useAuth();

  // Check for stored listing data and pending files on mount
  useEffect(() => {
    if (userId) {
      // Check for temp listing data first
      const tempData = localStorage.getItem("tempListingData");
      if (tempData) {
        setIsModalOpen(true);
        return;
      }

      // Check for pending files from homepage
      const pendingSession = localStorage.getItem("pendingListingSession");
      if (pendingSession) {
        const pendingFiles = localStorage.getItem(
          `pendingFiles_${pendingSession}`
        );
        if (pendingFiles) {
          try {
            const { files, timestamp } = JSON.parse(pendingFiles);

            // Convert base64 back to File objects
            Promise.all(
              files.map(async (fileData: any) => {
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
        }
      }
    }
  }, [userId]);

  const handleFilesSelected = (files: File[]) => {
    // Validate files first
    if (files.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    if (files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }

    // Check file types
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    // Check file sizes (max 15MB each)
    const oversizedFiles = files.filter((file) => file.size > 15 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(
        "Some files are larger than 15MB. Please select smaller files."
      );
      return;
    }

    setSelectedFiles(files);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
    setIsCreatingListing(false);
    // Clear all temp data when modal is closed
    localStorage.removeItem("tempListingData");
    localStorage.removeItem("pendingListingSession");
    const pendingSession = localStorage.getItem("pendingListingSession");
    if (pendingSession) {
      localStorage.removeItem(`pendingFiles_${pendingSession}`);
    }
  };

  return (
    <>
      <FileUpload
        buttonText='Create new listing Reels'
        onFilesSelected={handleFilesSelected}
        uploadUrl=''
        maxFiles={10}
        maxSize={15}
        accept='image/*'
      />

      <NewListingModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialFiles={selectedFiles}
      />
    </>
  );
}
