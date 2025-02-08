"use client";

import FileUpload from "@/components/reelty/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateJob } from "@/hooks/use-jobs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdditionalPhotosModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdditionalPhotosModal({
  listingId,
  isOpen,
  onClose,
  onSuccess,
}: AdditionalPhotosModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const createJob = useCreateJob();

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
      // Upload the additional photos
      const formData = new FormData();
      selectedPhotos.forEach((file, index) => {
        formData.append(`files`, file);
        formData.append(`orders`, index.toString());
      });

      const response = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photos");
      }

      const { filePaths } = await response.json();

      // Create a new job with pro template
      await createJob.mutateAsync({
        listingId,
        template: "pro",
        inputFiles: filePaths,
      });

      toast.success("Additional photos uploaded and processing started!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[ADDITIONAL_PHOTOS_ERROR]", error);
      toast.error("Failed to process additional photos");
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
