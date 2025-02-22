import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { AdditionalPhotosModal } from "@/components/modals/AdditionalPhotosModal";
import { ProcessedPhoto } from "@/hooks/use-photo-processing";
import { cn } from "@/lib/utils";

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
  // Only update internal state when selectedIds prop changes
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedIds || [])
  );

  // Sync with parent when selectedIds changes
  useEffect(() => {
    const newSelected = new Set(selectedIds || []);
    // Only update if the sets are different
    if (JSON.stringify([...selected]) !== JSON.stringify([...newSelected])) {
      setSelected(newSelected);
    }
  }, [selectedIds]);

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= 20) {
        return; // Don't allow more than 20 selections
      }
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelect?.(Array.from(newSelected));
  };

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {photos.map((photo, index) => (
            <div key={photo.uiId} className='relative group'>
              <div
                className='relative aspect-square rounded-lg overflow-hidden cursor-pointer'
                onClick={() => handleSelect(photo.uiId)}
              >
                <img
                  src={photo.previewUrl}
                  alt={`Photo ${index + 1}`}
                  className='w-full h-full object-cover'
                />
                <div
                  className={cn(
                    "absolute inset-0 transition-colors",
                    selected.has(photo.uiId)
                      ? "bg-black/20"
                      : "bg-black/5 group-hover:bg-black/20"
                  )}
                />
                {selected.has(photo.uiId) && (
                  <div className='absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white text-sm'>
                    {Array.from(selected).indexOf(photo.uiId) + 1}
                  </div>
                )}
              </div>
            </div>
          ))}
          {photos.length < maxPhotos && onAddPhotos && (
            <label className='relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors'>
              <div className='flex flex-col items-center gap-2'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#666'
                  strokeWidth='2'
                >
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='17 8 12 3 7 8' />
                  <line x1='12' y1='3' x2='12' y2='15' />
                </svg>
                <span className='text-[13px] text-gray-600'>Upload More</span>
              </div>
              <input
                type='file'
                multiple
                accept='image/*'
                className='hidden'
                onChange={onAddPhotos}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </label>
          )}
        </div>
      </Card>

      <AdditionalPhotosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
}
