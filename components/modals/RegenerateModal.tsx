"use client";

import { Dialog } from "@headlessui/react";
import { useToast } from "../common/Toast";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type VideoTemplate = "crescendo" | "wave" | "storyteller" | "googleZoom";

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

  const { data: listing } = trpc.listings.getById.useQuery(
    { id: listingId },
    { enabled: isOpen }
  );

  const regenerateMutation = trpc.createVideo.useMutation({
    onSuccess: () => {
      showToast("Video regeneration started successfully", "success");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      showToast(error.message || "Failed to regenerate video", "error");
    },
  });

  const handleRegenerate = async () => {
    if (!user) {
      showToast("Please log in to regenerate videos", "error");
      return;
    }

    if (!listing?.photos?.length) {
      showToast("No images available for video generation", "error");
      return;
    }

    try {
      await regenerateMutation.mutateAsync({
        listingId,
        userId: user.uid,
        template,
        images: listing.photos.map(
          (photo) => `${process.env.NEXT_PUBLIC_CDN_URL}/${photo.filePath}`
        ),
      });
    } catch (error) {
      // Error handled by mutation callbacks
      console.error("Video regeneration error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel 
            className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
          >
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 text-gray-900'
                >
                  Regenerate Video
                </Dialog.Title>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Are you sure you want to regenerate the video for this
                    listing using the {template} template? This will create a
                    new video using all available listing photos.
                  </p>
                </div>

                <div className='mt-4 flex justify-end space-x-3'>
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
                      regenerateMutation.isLoading || !listing?.photos?.length
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
                      "Regenerate"
                    )}
                  </button>
                </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
