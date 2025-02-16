import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { AdditionalPhotosModal } from "@/components/modals/AdditionalPhotosModal";
import { ProcessedPhoto } from "@/hooks/use-photo-processing";

interface PhotoManagerProps {
  photos: ProcessedPhoto[];
  onAddPhotos?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxPhotos?: number;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
}

export default function PhotoManager({
  photos,
  onAddPhotos,
  maxPhotos = 60,
  onSelect,
  selectedIds,
}: PhotoManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedIds || [])
  );

  useEffect(() => {
    if (selectedIds) {
      setSelected(new Set(selectedIds));
    }
  }, [selectedIds]);

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= 10) {
        return; // Don't allow more than 10 selections
      }
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelect?.(Array.from(newSelected));
  };

  return (
    <div className='space-y-4'>
      {/* Grid of photos */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className={`relative aspect-[3/4] overflow-hidden cursor-pointer transition-all ${
              selected.has(photo.id)
                ? "ring-2 ring-purple-500 ring-offset-2"
                : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
            }`}
            onClick={() => handleSelect(photo.id)}
          >
            <img
              src={photo.previewUrl}
              alt={`Photo ${photo.id}`}
              className='w-full h-full object-cover'
            />
            {/* Selection indicator */}
            {selected.has(photo.id) && (
              <div className='absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm'>
                {Array.from(selected).indexOf(photo.id) + 1}
              </div>
            )}
            {/* Status indicator */}
            {photo.status === "processing" && (
              <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2'>
                Processing...
              </div>
            )}
            {photo.status === "failed" && (
              <div className='absolute bottom-0 left-0 right-0 bg-red-500/50 text-white text-xs py-1 px-2'>
                Failed to process
              </div>
            )}
          </Card>
        ))}

        {/* Add more photos button */}
        {photos.length < maxPhotos && onAddPhotos && (
          <Card
            className='aspect-[3/4] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={() => setIsModalOpen(true)}
          >
            <div className='flex flex-col items-center gap-2'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M12 5v14M5 12h14' />
              </svg>
              <span className='text-sm'>Add Photos</span>
            </div>
          </Card>
        )}
      </div>

      {/* Additional photos modal */}
      <AdditionalPhotosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
}
