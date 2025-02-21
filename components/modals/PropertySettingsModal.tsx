import { useToast } from "@/components/common/Toast";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PropertySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  photos: Array<{
    id: string;
    url: string;
    hasError: boolean;
    status: "error" | "processing" | "completed";
  }>;
  onRegenerateImage: (photoIds: string | string[]) => Promise<void>;
  isLoading?: boolean;
}

export const PropertySettingsModal: React.FC<PropertySettingsModalProps> = ({
  isOpen,
  onClose,
  address,
  photos,
  onRegenerateImage,
  isLoading = false,
}) => {
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
      // Convert Set to Array and regenerate all photos in one call
      const photoIdsArray = Array.from(selectedPhotos);
      if (onRegenerateImage) {
        await onRegenerateImage(photoIdsArray);
      }
      // Toast is now handled in the parent component
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      showToast("Failed to regenerate images", "error");
    } finally {
      setIsRegenerating(false);
      setSelectedPhotos(new Set());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[1200px] w-[calc(100%-2rem)] p-0 overflow-hidden'>
        <DialogTitle className='sr-only'>Property Settings</DialogTitle>
        <DialogDescription className='sr-only'>
          Select photos to regenerate videos for {address}
        </DialogDescription>

        {isLoading ? (
          <div className='flex items-center justify-center min-h-[200px]'>
            <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : (
          <div className='flex flex-col'>
            {/* Content Area */}
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
                        </>
                      )}
                      {photo.status === "error" && (
                        <div className='absolute top-2 left-2'>
                          <div className='bg-red-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-md'>
                            Error
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
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
                  <>
                    <svg
                      className='animate-spin h-4 w-4'
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
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3' />
                    </svg>
                    Regenerate Selected ({selectedPhotos.size})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
