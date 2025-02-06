"use client";

import { Dialog } from "@headlessui/react";
import { useToast } from "../common/Toast";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TRPCClientErrorLike } from "@trpc/client";
import type { RouterOutput } from "@/types/trpc";
import { useState } from "react";
import Image from "next/image";

type VideoTemplate = "crescendo" | "wave" | "storyteller" | "googleZoom";
type VideoJob = RouterOutput["jobs"]["createVideo"];
type Property = RouterOutput["property"]["getById"];

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  template: VideoTemplate;
  onSuccess?: () => void;
}

export default function RegenerateModal({
  isOpen,
  onClose,
  listingId,
  template,
  onSuccess,
}: RegenerateModalProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const { data: listing } = trpc.property.getById.useQuery(
    { id: listingId },
    { enabled: !!listingId }
  );

  const regenerateMutation = trpc.jobs.regenerateVideos.useMutation({
    onSuccess: () => {
      toast.success("Video regeneration started");
      onClose();
      onSuccess?.();
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      toast.error(error.message || "Failed to regenerate video");
    },
  });

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId);
      }
      if (prev.length >= 3) {
        toast.error("You can only select up to 3 photos for regeneration");
        return prev;
      }
      return [...prev, photoId];
    });
  };

  const handleRegenerate = async () => {
    if (!user) {
      showToast("Please log in to regenerate videos", "error");
      return;
    }

    if (!selectedPhotos.length) {
      showToast("Please select at least one photo to regenerate", "error");
      return;
    }

    try {
      await regenerateMutation.mutateAsync({
        listingId,
        photoIds: selectedPhotos,
        template,
      });
    } catch (error) {
      // Error handled by mutation callbacks
      console.error("Video regeneration error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/25' aria-hidden='true' />

      <div className='fixed inset-0 overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4 text-center'>
          <Dialog.Panel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
            <Dialog.Title
              as='h3'
              className='text-lg font-medium leading-6 text-gray-900'
            >
              Regenerate Videos
            </Dialog.Title>
            <div className='mt-2'>
              <p className='text-sm text-gray-500 mb-4'>
                Select up to 3 photos that you'd like to regenerate videos for.
                This will create new videos for the selected photos using the{" "}
                {template} template.
              </p>

              {/* Photo Grid */}
              <div className='grid grid-cols-3 gap-4 mt-4'>
                {listing?.photos?.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden ${
                      selectedPhotos.includes(photo.id)
                        ? "ring-2 ring-blue-500"
                        : ""
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
                      <div className='absolute inset-0 bg-blue-500/20 flex items-center justify-center'>
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
            </div>

            <div className='mt-6 flex justify-end space-x-3'>
              <button
                type='button'
                className='inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type='button'
                className='inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={handleRegenerate}
                disabled={
                  regenerateMutation.isLoading || !selectedPhotos.length
                }
              >
                {regenerateMutation.isLoading ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Regenerate ${selectedPhotos.length} Video${
                    selectedPhotos.length !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
