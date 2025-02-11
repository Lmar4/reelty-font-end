"use client";

import { Photo } from "@/types/prisma-types";
import Image from "next/image";
import { getBaseS3Url } from "@/utils/s3-url";
import { Card } from "@/components/ui/card";

interface PhotoGridProps {
  photos: Photo[];
  photoLimit: number;
}

const getPhotoUrl = (photo: Photo) => {
  return photo.processedFilePath
    ? getBaseS3Url(photo.processedFilePath)
    : getBaseS3Url(photo.filePath);
};

export const PhotoGrid = ({ photos, photoLimit }: PhotoGridProps) => {
  return (
    <Card className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold'>
          Photos ({photos.length}/{photoLimit})
        </h3>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className='relative aspect-square rounded-lg overflow-hidden'
          >
            <Image
              src={getPhotoUrl(photo)}
              alt={`Property photo ${photo.order + 1}`}
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
              priority={photo.order === 0}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
