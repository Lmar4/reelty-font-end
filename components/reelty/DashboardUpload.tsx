"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import NewListingModal from "./NewListingModal";
import { toast } from "sonner";

export function DashboardUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

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
