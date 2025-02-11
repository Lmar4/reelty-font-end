import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/common/Toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PropertySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  address: string;
  photos: Array<{
    id: string;
    url: string;
    hasError?: boolean;
  }>;
}

export function PropertySettingsModal({
  isOpen,
  onClose,
  jobId,
  address,
  photos,
}: PropertySettingsModalProps) {
  const { showToast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleRegenerateClick = async () => {
    if (selectedPhotos.size === 0) return;

    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to regenerate videos");
      }

      showToast("Videos are being regenerated", "success");
      onClose();
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to regenerate videos. Please try again.",
        "error"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='bg-white rounded-lg max-w-[1200px] w-[calc(100%-2rem)] max-h-[90vh] relative mx-auto flex flex-col overflow-hidden my-8'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute right-3 top-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M18 6L6 18'></path>
            <path d='M6 6l12 12'></path>
          </svg>
        </button>

        {/* Content Area */}
        <div className='overflow-y-auto flex-1'>
          <div className='p-6'>
            <div className='flex flex-col gap-3 mb-6'>
              <h2 className='text-[24px] font-semibold text-black'>
                Had some errors?
              </h2>
              <p className='text-[15px] text-[#1c1c1c]/60'>{address}</p>
              <p className='text-[15px] text-[#1c1c1c]/80'>
                Select the photos you'd like to regenerate videos for:
              </p>
            </div>

            <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handlePhotoSelect(photo.id)}
                  className={`group relative aspect-square rounded-lg overflow-hidden focus:outline-none ${
                    selectedPhotos.has(photo.id) ? "ring-2 ring-black" : ""
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={`Photo ${photo.id}`}
                    fill
                    className='object-cover'
                  />
                  {/* Selection Overlay */}
                  <div
                    className={`absolute inset-0 transition-colors ${
                      selectedPhotos.has(photo.id)
                        ? "bg-black/40"
                        : "bg-black/0 group-hover:bg-black/20"
                    }`}
                  >
                    {selectedPhotos.has(photo.id) && (
                      <>
                        <div className='absolute top-2 right-2'>
                          <div className='w-6 h-6 bg-white rounded-full flex items-center justify-center'>
                            <svg
                              width='14'
                              height='14'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='black'
                              strokeWidth='3'
                            >
                              <polyline points='20 6 9 17 4 12' />
                            </svg>
                          </div>
                        </div>
                        {photo.hasError && (
                          <div className='absolute top-2 left-2'>
                            <div className='bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full'>
                              Error
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='bg-white p-4 border-t'>
          <button
            onClick={handleRegenerateClick}
            disabled={selectedPhotos.size === 0 || isRegenerating}
            className={`w-full rounded-lg h-12 text-[15px] font-medium flex items-center justify-center gap-2 ${
              selectedPhotos.size === 0 || isRegenerating
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            {isRegenerating ? (
              <LoadingSpinner className='w-5 h-5' />
            ) : (
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='white'
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <path d='M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z' />
                <path d='M5 17l1 2.5L8.5 21l-2.5 1L5 24l-1-2.5L1.5 21l2.5-1L5 17z' />
                <path d='M18 17l1 2.5L21.5 21l-2.5 1L18 24l-1-2.5L14.5 21l2.5-1L18 17z' />
              </svg>
            )}
            {isRegenerating
              ? "Regenerating..."
              : `Regenerate Selected (${selectedPhotos.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
