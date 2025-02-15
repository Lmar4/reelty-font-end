"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateJob } from "@/hooks/use-jobs";
import { useUploadPhoto } from "@/hooks/queries/use-listings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define valid template options
const TEMPLATE_OPTIONS = [
  "crescendo",
  "wave",
  "storyteller",
  "googleZoom",
] as const;
type Template = (typeof TEMPLATE_OPTIONS)[number];

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewListingModal = ({
  isOpen,
  onClose,
  onSuccess,
}: NewListingModalProps) => {
  const [template, setTemplate] = useState<Template>("crescendo");
  const [files, setFiles] = useState<File[]>([]);
  const [listingId, setListingId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const createJob = useCreateJob();
  const uploadPhoto = useUploadPhoto();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listingId) {
      toast.error("Please enter a listing ID");
      return;
    }

    if (files.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    try {
      setIsUploading(true);

      // Upload photos first
      const uploadedPaths: string[] = [];
      let failedUploads = 0;

      // Helper function to add delay between uploads
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      // Process files sequentially with delay
      for (let i = 0; i < files.length; i++) {
        try {
          // Add delay between uploads (skip delay for first upload)
          if (i > 0) {
            await delay(1000); // 1 second delay between uploads
          }

          const result = await uploadPhoto.mutateAsync({
            file: files[i],
            listingId,
            order: i,
          });

          console.log("[UPLOAD_RESULT]", {
            result,
            filePath: result?.data?.filePath,
          });

          // Extract the relative path from the S3 URL
          if (result?.data?.filePath) {
            try {
              // Extract just the key portion from the S3 URL (everything after the bucket name)
              const filePath = result.data.filePath;
              const bucketEndIndex =
                filePath.indexOf(".amazonaws.com/") + ".amazonaws.com/".length;
              const queryStartIndex = filePath.indexOf("?");
              const relativePath = filePath.slice(
                bucketEndIndex,
                queryStartIndex !== -1 ? queryStartIndex : undefined
              );

              console.log("[PATH_EXTRACTION]", {
                original: filePath,
                extracted: relativePath,
              });

              if (relativePath) {
                uploadedPaths.push(relativePath);
              } else {
                console.error("[PATH_EXTRACTION_ERROR]", {
                  error: "Failed to extract relative path",
                  filePath,
                });
                failedUploads++;
              }
            } catch (error) {
              console.error("[PATH_EXTRACTION_ERROR]", {
                error,
                filePath: result.data.filePath,
              });
              failedUploads++;
            }
          } else {
            console.error("[UPLOAD_RESPONSE_ERROR]", {
              error: "Missing filePath in response",
              result,
            });
            failedUploads++;
          }
        } catch (error) {
          console.error("[PHOTO_UPLOAD_ERROR]", {
            fileName: files[i].name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          failedUploads++;
          toast.error(`Failed to upload ${files[i].name}`);
        }
      }

      // Show summary of failed uploads
      if (failedUploads > 0) {
        toast.error(
          `${failedUploads} photo${
            failedUploads > 1 ? "s" : ""
          } failed to upload`
        );
      }

      // Validate we have at least one valid file path
      if (uploadedPaths.length === 0) {
        toast.error("No photos were uploaded successfully");
        return;
      }

      console.log("[CREATING_JOB]", {
        listingId,
        template,
        inputFiles: uploadedPaths,
      });

      // Create job with uploaded file paths
      await createJob.mutateAsync({
        listingId,
        template,
        inputFiles: uploadedPaths,
      });

      toast.success(
        `Job created with ${uploadedPaths.length} photo${
          uploadedPaths.length > 1 ? "s" : ""
        }`
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[SUBMIT_JOB_ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error("Failed to create job");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='listingId'>Listing ID</Label>
            <Input
              id='listingId'
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor='files'>Photos</Label>
            <Input
              id='files'
              type='file'
              multiple
              accept='image/*'
              onChange={(e) => {
                const fileList = e.target.files;
                if (fileList) {
                  setFiles(Array.from(fileList));
                }
              }}
              required
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose} type='button'>
              Cancel
            </Button>
            <Button type='submit' disabled={isUploading || createJob.isPending}>
              {isUploading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading photos...
                </>
              ) : createJob.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating job...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
