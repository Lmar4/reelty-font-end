"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import NewListingModal from "./NewListingModal";

export function DashboardUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  const handleFilesSelected = (files: File[]) => {
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
      />

      <NewListingModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialFiles={selectedFiles}
      />
    </>
  );
}
