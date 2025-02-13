import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface PhotoManagerProps {
  photos: File[];
  onAddPhotos?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxPhotos?: number;
}

interface PhotoWithPreview {
  id: string;
  file: File;
  preview: string;
}

export default function PhotoManager({
  photos,
  onAddPhotos,
  maxPhotos = 60,
}: PhotoManagerProps) {
  const [items, setItems] = useState<PhotoWithPreview[]>([]);
  const previewUrlsRef = useRef<Map<string, string>>(new Map());

  // Initialize or update items when photos change, reusing existing previews
  useEffect(() => {
    const newItems = photos.map((file) => {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      let preview = previewUrlsRef.current.get(fileKey);

      if (!preview) {
        preview = URL.createObjectURL(file);
        previewUrlsRef.current.set(fileKey, preview);
      }

      return {
        id: fileKey,
        file,
        preview,
      };
    });

    setItems(newItems);

    // Cleanup unused URLs
    const newFileKeys = new Set(
      photos.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
    );

    previewUrlsRef.current.forEach((url, key) => {
      if (!newFileKeys.has(key)) {
        URL.revokeObjectURL(url);
        previewUrlsRef.current.delete(key);
      }
    });
  }, [photos]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {items.map((item, index) => (
            <div key={item.id} className='relative group'>
              <div className='relative aspect-square rounded-lg overflow-hidden'>
                <img
                  src={item.preview}
                  alt={`Photo ${index + 1}`}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors' />
              </div>
            </div>
          ))}
          {onAddPhotos && photos.length < maxPhotos && (
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
                onClick={(e) => {
                  e.preventDefault();
                  (e.target as HTMLInputElement).value = "";
                }}
                accept='image/*'
                className='hidden'
                onChange={onAddPhotos}
              />
            </label>
          )}
        </div>
      </Card>
    </div>
  );
}
