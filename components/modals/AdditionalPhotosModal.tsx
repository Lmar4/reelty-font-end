"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import type { PropertyOutput } from "@/types/trpc";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";



interface AdditionalPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyOutput;
  onSuccess?: () => void;
}

export default function AdditionalPhotosModal({
  isOpen,
  onClose,
  property,
  onSuccess,
}: AdditionalPhotosModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: listing } = trpc.property.getById.useQuery(
    { id: property.id },
    { enabled: !!property.id }
  );

  const generateVideosMutation = trpc.jobs.regenerateVideos.useMutation({
    onSuccess: () => {
      toast.success("Videos are being generated");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate videos");
    },
  });

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId);
      }
      return [...prev, photoId];
    });
  };

  const handleGenerate = async () => {
    if (!selectedPhotos.length) {
      toast.error("Please select at least one photo");
      return;
    }

    setIsLoading(true);
    try {
      const templates = ["wave", "storyteller", "googleZoom"] as const;
      for (const template of templates) {
        await generateVideosMutation.mutateAsync({
          listingId: property.id,
          photoIds: selectedPhotos,
          template,
        });
      }
    } catch (error) {
      console.error("Error generating videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Select Additional Photos</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground mb-6'>
          As a Pro user, you can now generate videos for these photos using all
          premium templates. Select the photos you&apos;d like to process.
        </p>

        {/* Photo Grid */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          {listing?.photos?.map((photo) => (
            <div
              key={photo.id}
              className={`relative cursor-pointer rounded-lg overflow-hidden ${
                selectedPhotos.includes(photo.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handlePhotoSelect(photo.id)}
            >
              <Image
                src={photo.filePath}
                alt='Listing photo'
                width={200}
                height={150}
                className='w-full aspect-[4/3] object-cover'
              />
              {selectedPhotos.includes(photo.id) && (
                <div className='absolute inset-0 bg-primary/20 flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='flex justify-end space-x-3'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedPhotos.length}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              `Generate Videos (${selectedPhotos.length} photos)`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
