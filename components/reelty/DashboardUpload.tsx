"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import NewListingModal from "./NewListingModal";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { userId } = useAuth();

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
