"use client";

import FileUpload from "@/components/reelty/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface AdditionalPhotosModalProps {
  listingId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
}

export function AdditionalPhotosModal({
  listingId: providedListingId,
  isOpen,
  onClose,
  onSuccess,
}: AdditionalPhotosModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotosSelected = (files: File[]) => {
    // Only allow selecting up to 10 additional photos
    if (files.length > 10) {
      toast.error("You can only select up to 10 additional photos");
      return;
    }
    setSelectedPhotos(files);
  };

  const handleSubmit = async () => {
    if (selectedPhotos.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    setIsUploading(true);
    try {
      // Generate a new UUID if no listingId is provided
      const listingId = providedListingId || uuidv4();

      // Upload the additional photos
      const formData = new FormData();

      // Ensure each file is properly appended with the correct field name
      selectedPhotos.forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image`);
        }
        formData.append("files", file);
      });

      const response = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload photos");
      }

      const { photos, jobId } = await response.json();

      toast.success(
        `${photos.length} photos uploaded successfully! Job ${jobId} will start processing soon.`
      );
      setSelectedPhotos([]); // Clear selected photos
      onSuccess?.(listingId);
      onClose();
    } catch (error) {
      console.error("[PHOTOS_UPLOAD_ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photos"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Select Additional Photos</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>
              Congratulations on upgrading! You can now select up to 10
              additional photos for your listing. These will be processed with
              our premium templates.
            </p>
          </div>

          <FileUpload
            buttonText='Select additional photos'
            onFilesSelected={handlePhotosSelected}
            maxFiles={10}
            accept='image/*'
            maxSize={15}
          />

          {selectedPhotos.length > 0 && (
            <p className='text-sm text-muted-foreground'>
              {selectedPhotos.length} photos selected
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isUploading || selectedPhotos.length === 0}
            className='w-full bg-black text-white rounded-lg h-12 font-semibold flex items-center justify-center gap-2 disabled:opacity-50'
          >
            {isUploading ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin' />
                Uploading...
              </>
            ) : (
              "Process Additional Photos"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
