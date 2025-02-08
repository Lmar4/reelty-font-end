"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useCreateJob } from "@/hooks/use-jobs";
import { useCreateListing, useUploadPhoto } from "@/hooks/queries/use-listings";
import { useRouter } from "next/navigation";

// Initialize Google Maps loader
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  version: "weekly",
  libraries: ["places"],
});

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles: File[];
}

// Utility function to compress image
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Calculate new dimensions (max 400px width for thumbnails)
        const maxWidth = 400;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to WebP with low quality for thumbnails
        resolve(canvas.toDataURL("image/webp", 0.3));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function NewListingModal({
  isOpen,
  onClose,
  initialFiles,
}: NewListingModalProps) {
  const { userId } = useAuth();
  const createJob = useCreateJob();
  const createListing = useCreateListing();
  const uploadPhoto = useUploadPhoto();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [compressedUrls, setCompressedUrls] = useState<
    { url: string; id: string }[]
  >([]);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps
  useEffect(() => {
    loader
      .load()
      .then(() => setIsLoaded(true))
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        toast.error("Error loading Google Maps");
      });
  }, []);

  const {
    ready,
    value,
    suggestions: { status: autocompleteStatus, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    cache: 24 * 60 * 60,
    requestOptions: {},
    initOnMount: isLoaded, // Only initialize when Google Maps is loaded
  });

  // Handle initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      setUploadedPhotos(initialFiles);
      // Auto-select first 10 photos
      setSelectedPhotos(
        new Set(initialFiles.slice(0, 10).map((_, i) => String(i)))
      );

      // Compress initial files
      Promise.all(
        initialFiles.map(async (file) => ({
          url: await compressImage(file),
          id: Math.random().toString(36).substring(7),
        }))
      ).then(setCompressedUrls);
    }
  }, [initialFiles]);

  // Handle additional files compression
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

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    setAddress(description);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setCoordinates({ lat, lng });
    } catch (error) {
      console.error("Error getting geocode:", error);
      toast.error("Error getting location coordinates");
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!address || !coordinates) {
      toast.error("Please enter a valid address");
      return;
    }

    if (selectedPhotos.size === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    // If user is not logged in, store data and redirect to login
    if (!userId) {
      // Store the current state in localStorage
      const selectedPhotoFiles = Array.from(selectedPhotos).map(
        (index) => uploadedPhotos[parseInt(index)]
      );

      const tempListingData = {
        address,
        coordinates,
        selectedPhotos: Array.from(selectedPhotos),
        timestamp: Date.now(), // Add timestamp for cleanup purposes
      };

      localStorage.setItem("tempListingData", JSON.stringify(tempListingData));

      // Redirect to login
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    setStatus("Creating listing...");

    try {
      // Create listing first
      const listing = await createListing.mutateAsync({
        userId,
        address,
        coordinates,
        photoLimit: 10,
      });

      if (!listing?.id) {
        throw new Error("Failed to create listing - no listing ID returned");
      }

      setProgress(20);
      setStatus("Preparing photos for upload...");

      // Filter only selected photos
      const selectedPhotoFiles = Array.from(selectedPhotos).map(
        (index) => uploadedPhotos[parseInt(index)]
      );

      // Upload photos with retries
      const uploadWithRetry = async (
        file: File,
        order: number,
        retries = 3
      ): Promise<string> => {
        try {
          const result = await uploadPhoto.mutateAsync({
            file,
            listingId: listing.id,
            order,
          });
          return result.filePath;
        } catch (error) {
          console.error(
            `Upload attempt failed (${retries} retries left):`,
            error
          );
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return uploadWithRetry(file, order, retries - 1);
          }
          throw error;
        }
      };

      setStatus("Uploading photos...");
      const totalPhotos = selectedPhotoFiles.length;
      const uploadedPaths: string[] = [];

      for (let i = 0; i < selectedPhotoFiles.length; i++) {
        const file = selectedPhotoFiles[i];
        try {
          setStatus(`Uploading photo ${i + 1} of ${totalPhotos}...`);
          const filePath = await uploadWithRetry(file, i);
          uploadedPaths.push(filePath);
          setProgress(20 + Math.floor(((i + 1) / totalPhotos) * 40));
        } catch (error) {
          console.error(`Failed to upload photo ${i + 1}:`, error);
          toast.error(`Failed to upload photo ${i + 1}. Please try again.`);
          throw error;
        }
      }

      setProgress(60);
      setStatus("Creating video...");

      // Create video generation job
      await createJob.mutateAsync({
        listingId: listing.id,
        template: "basic",
        inputFiles: uploadedPaths,
      });

      setProgress(100);
      setStatus("Complete!");

      toast.success("Listing created successfully!");
      onClose();

      // Clear any stored temp data
      localStorage.removeItem("tempListingData");

      // Redirect after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/listings/${listing.id}`);
      }, 1000);
    } catch (error) {
      console.error("[LISTING_CREATION_ERROR]", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setProgress(0);
      setStatus("");
    }
  };

  // Add effect to restore data after login
  useEffect(() => {
    if (userId) {
      const tempData = localStorage.getItem("tempListingData");
      if (tempData) {
        try {
          const {
            address: savedAddress,
            coordinates: savedCoordinates,
            selectedPhotos: savedPhotos,
          } = JSON.parse(tempData);

          // Restore the saved data
          setAddress(savedAddress);
          setCoordinates(savedCoordinates);
          setSelectedPhotos(new Set(savedPhotos));

          // Don't remove the data yet - wait until successful creation
        } catch (error) {
          console.error("Error restoring temp listing data:", error);
          localStorage.removeItem("tempListingData");
        }
      }
    }
  }, [userId]);

  // Memoize the grid to prevent unnecessary re-renders
  const photoGrid = useMemo(() => {
    return uploadedPhotos
      .map((photo, index) => {
        const isSelected = selectedPhotos.has(String(index));
        if (!compressedUrls[index]) return null; // Skip if compressed URL not ready

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

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when modal is open
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
      className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto sm:overflow-visible'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg max-w-[900px] w-[calc(100%-2rem)] max-h-[80vh] sm:max-h-[90vh] relative mx-auto flex flex-col overflow-hidden'>
        {/* Close button - Floating */}
        <button
          onClick={onClose}
          className='absolute right-3 top-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm sm:hidden'
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

        {/* Scrollable Content Area */}
        <div className='overflow-y-auto flex-1'>
          {/* Address Input Section */}
          <div className='p-4 border-b'>
            <Label htmlFor='address'>Listing Address</Label>
            <div className='relative'>
              <Input
                id='address'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready || !isLoaded}
                placeholder='Enter listing address'
                className='w-full'
              />
              {autocompleteStatus === "OK" && (
                <ul className='absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto'>
                  {data.map(({ place_id, description }) => (
                    <li
                      key={place_id}
                      onClick={() => handleSelect(description)}
                      className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                    >
                      {description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Photo Selection Section */}
          <div className='p-4'>
            <div className='flex flex-col gap-3 mb-4'>
              <h2 className='text-[24px] font-semibold text-black'>
                New Listing Reels
              </h2>
              {/* Progress Bar */}
              <div>
                <div className='flex items-center justify-between text-[18px] font-semibold mb-2 text-black'>
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
            </div>

            <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
              {photoGrid}
              {uploadedPhotos.length < 60 && (
                <label className='relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors'>
                  <div className='flex flex-col items-center gap-2'>
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#666'
                      strokeWidth='2'
                    >
                      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                      <polyline points='17 8 12 3 7 8' />
                      <line x1='12' y1='3' x2='12' y2='15' />
                    </svg>
                    <span className='text-[15px] text-gray-600'>
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

        {/* Generate Button - Fixed to bottom */}
        <div className='bg-white pb-3 px-3 sm:px-4 sm:pb-4'>
          <button
            className='w-full bg-black text-white rounded-lg h-10 sm:h-12 text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50'
            onClick={handleSubmit}
            disabled={isSubmitting || selectedPhotos.size === 0 || !address}
          >
            {isSubmitting ? (
              <>
                <svg
                  className='animate-spin h-5 w-5 text-white'
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
                {status}
              </>
            ) : (
              <>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='white'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z' />
                  <path d='M5 17l1 2.5L8.5 21l-2.5 1L5 24l-1-2.5L1.5 21l2.5-1L5 17z' />
                  <path d='M18 17l1 2.5L21.5 21l-2.5 1L18 24l-1-2.5L14.5 21l2.5-1L18 17z' />
                </svg>
                Create Listing
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
