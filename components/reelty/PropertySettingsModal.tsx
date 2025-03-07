"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";

interface PropertySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  address: string;
  currentPhotos: File[];
}

// Utility function to compress image
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 400;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", 0.3));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function PropertySettingsModal({
  isOpen,
  onClose,
  propertyId,
  address,
  currentPhotos,
}: PropertySettingsModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [compressedUrls, setCompressedUrls] = useState<
    { url: string; id: string }[]
  >([]);

  // Handle initial photos
  useEffect(() => {
    if (currentPhotos.length > 0) {
      setUploadedPhotos(currentPhotos);
      // Auto-select first 10 photos or all current photos if less than 10
      setSelectedPhotos(
        new Set(currentPhotos.slice(0, 10).map((_, i) => String(i)))
      );

      // Compress initial files
      Promise.all(
        currentPhotos.map(async (file) => ({
          url: await compressImage(file),
          id: Math.random().toString(36).substring(7),
        }))
      ).then(setCompressedUrls);
    }
  }, [currentPhotos]);

  // Handle additional files
  const handleAdditionalFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [...uploadedPhotos, ...newFiles];

      if (totalFiles.length > 60) {
        alert("Maximum 60 photos allowed");
        return;
      }

      const oversizedFiles = newFiles.filter(
        (file) => file.size > 15 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        alert("Some files are larger than 15MB. Please select smaller files.");
        return;
      }

      setUploadedPhotos(totalFiles);

      // Compress new files and add to existing
      const newCompressedUrls = await Promise.all(
        newFiles.map(async (file) => ({
          url: await compressImage(file),
          id: Math.random().toString(36).substring(7),
        }))
      );

      setCompressedUrls((prev) => [...prev, ...newCompressedUrls]);
    }
  };

  const handlePhotoSelect = useCallback((index: number) => {
    const indexStr = String(index);
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(indexStr)) {
        newSet.delete(indexStr);
      } else if (newSet.size < 10) {
        newSet.add(indexStr);
      }
      return newSet;
    });
  }, []);

  // Memoize the grid to prevent unnecessary re-renders
  const photoGrid = useMemo(() => {
    return uploadedPhotos
      .map((photo, index) => {
        const isSelected = selectedPhotos.has(String(index));
        if (!compressedUrls[index]) return null;

        return (
          <button
            key={compressedUrls[index].id}
            className='relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group bg-gray-100 focus:outline-none'
            onClick={() => handlePhotoSelect(index)}
            type='button'
          >
            <div className='absolute inset-0'>
              <Image
                src={compressedUrls[index].url}
                alt={`Photo ${index + 1}`}
                fill
                sizes='(max-width: 640px) 120px, (max-width: 1024px) 160px, 200px'
                className='object-cover'
                priority={index < 4}
                loading={index >= 4 ? "lazy" : undefined}
                quality={30}
              />
              {/* Dark overlay for unselected images */}
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  isSelected ? "opacity-0" : "bg-black/40"
                }`}
              />
            </div>
            {isSelected && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-7 h-7 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center'>
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='black'
                    strokeWidth='3.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })
      .filter(Boolean);
  }, [uploadedPhotos, selectedPhotos, compressedUrls]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg max-w-[900px] w-[calc(100%-2rem)] max-h-[90vh] sm:max-h-[90vh] relative mx-auto flex flex-col overflow-hidden my-4 sm:my-0'>
        {/* Header with sticky close button */}
        <div className='sticky top-0 z-10 bg-white border-b border-gray-100 flex justify-between items-center p-4'>
          <h2 className='text-[20px] sm:text-[24px] font-semibold text-black'>
            Property Settings
          </h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200'
            aria-label='Close modal'
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
        </div>

        {/* Content Area */}
        <div className='overflow-y-auto flex-1'>
          <div className='p-4'>
            <p className='text-[15px] text-[#1c1c1c]/60 mb-4'>{address}</p>

            {/* Photo Selection Section */}
            <div className='mb-4'>
              <h3 className='text-[16px] sm:text-[18px] font-semibold mb-3 text-black'>
                Update Photos
              </h3>
              <div className='flex items-center justify-between text-[14px] sm:text-[15px] font-medium mb-2 text-black'>
                <span>{selectedPhotos.size} of 10 photos selected</span>
                <span>{Math.round((selectedPhotos.size / 10) * 100)}%</span>
              </div>
              <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-purple-500 transition-all duration-300'
                  style={{ width: `${(selectedPhotos.size / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3'>
              {photoGrid}
              {uploadedPhotos.length < 60 && (
                <label className='relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors'>
                  <div className='flex flex-col items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#666'
                      strokeWidth='2'
                      className='sm:w-6 sm:h-6'
                    >
                      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                      <polyline points='17 8 12 3 7 8' />
                      <line x1='12' y1='3' x2='12' y2='15' />
                    </svg>
                    <span className='text-[13px] sm:text-[15px] text-gray-600'>
                      Upload More
                    </span>
                  </div>
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    className='hidden'
                    onChange={handleAdditionalFiles}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Made sticky */}
        <div className='sticky bottom-0 bg-white py-3 px-3 sm:px-4 sm:py-4 flex gap-3 border-t border-gray-100 shadow-sm'>
          <button
            onClick={onClose}
            className='flex-1 border border-gray-200 text-black rounded-lg h-10 sm:h-12 text-[15px] sm:text-[16px] font-semibold hover:bg-gray-50'
          >
            Cancel
          </button>
          <button className='flex-1 bg-black text-white rounded-lg h-10 sm:h-12 text-[15px] sm:text-[16px] font-semibold flex items-center justify-center gap-2'>
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
            Regenerate Reels
          </button>
        </div>
      </div>
    </div>
  );
}
