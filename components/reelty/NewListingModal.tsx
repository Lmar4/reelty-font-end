"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateListing, useUploadPhoto } from "@/hooks/queries/use-listings";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import PhotoManager from "./PhotoManager";

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

export default function NewListingModal({
  isOpen,
  onClose,
  initialFiles,
}: NewListingModalProps) {
  const { userId, isSignedIn } = useAuth();

  const router = useRouter();

  const createListing = useCreateListing();
  const uploadPhoto = useUploadPhoto();

  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [currentListingId, setCurrentListingId] = useState<string>("");

  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
    suggestions: { status: autocompleteStatus, data },
    setValue: setPlacesValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    cache: 24 * 60 * 60,
    requestOptions: {},
    initOnMount: isLoaded,
  });

  // Handle initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      setUploadedPhotos(initialFiles);
      // Auto-select first 10 photos
      setSelectedPhotos(
        new Set(initialFiles.slice(0, 10).map((_, i) => String(i)))
      );
    }
  }, [initialFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setPlacesValue(value);
  };

  const handleSelect = async (description: string) => {
    setInputValue(description);
    setPlacesValue(description, false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !coordinates) {
      toast.error("Please enter a valid address");
      return;
    }

    if (selectedPhotos.size === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    if (!userId || !isSignedIn) {
      // Store the current state in sessionStorage (more reliable than localStorage for large data)
      const sessionData = {
        address,
        coordinates,
        selectedPhotos: Array.from(selectedPhotos),
        uploadedPhotos: uploadedPhotos.map((file) => ({
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
        })),
      };

      sessionStorage.setItem("pendingListing", JSON.stringify(sessionData));

      // Store files in IndexedDB for better storage handling
      const dbName = "reeltyTemp";
      const storeName = "pendingFiles";
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => {
        console.error("Error opening IndexedDB");
        toast.error("Error saving files. Please try again.");
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);

        // Store each file
        for (const file of uploadedPhotos) {
          await store.put(file, file.name);
        }

        // Store the redirect path in sessionStorage
        sessionStorage.setItem("postSignUpRedirect", "/dashboard/new-listing");

        // Redirect to sign-up page
        router.push("/sign-up");
      };

      return;
    }

    try {
      setIsSubmitting(true);
      setProgress(0);
      setStatus("Creating listing...");

      // Create listing first
      console.log("[CREATE_LISTING] Creating listing with:", {
        address,
        coordinates,
        photoLimit: selectedPhotos.size,
      });
      const listing = await createListing.mutateAsync({
        address,
        coordinates,
        photoLimit: selectedPhotos.size,
      });

      if (!listing?.id) {
        throw new Error("Failed to create listing - no listing ID returned");
      }

      setCurrentListingId(listing.id);
      setProgress(30);
      setStatus("Uploading photos...");

      // Filter only selected photos
      const selectedPhotoFiles = Array.from(selectedPhotos).map(
        (index) => uploadedPhotos[parseInt(index)]
      );

      // Upload photos with retries
      const uploadWithRetry = async (
        file: File,
        order: number,
        retries = 3
      ): Promise<void> => {
        try {
          await uploadPhoto.mutateAsync({
            file,
            listingId: listing.id,
            order,
          });
        } catch (error) {
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return uploadWithRetry(file, order, retries - 1);
          }
          throw error;
        }
      };

      setStatus("Uploading photos...");
      const totalPhotos = selectedPhotoFiles.length;

      for (let i = 0; i < selectedPhotoFiles.length; i++) {
        const file = selectedPhotoFiles[i];
        try {
          setStatus(`Uploading photo ${i + 1} of ${totalPhotos}...`);
          await uploadWithRetry(file, i);
          setProgress(30 + Math.floor(((i + 1) / totalPhotos) * 70));
        } catch (error) {
          console.error(`Failed to upload photo ${i + 1}:`, error);
          toast.error(`Failed to upload photo ${i + 1}. Please try again.`);
          throw error;
        }
      }

      setProgress(100);
      setStatus("Complete!");

      toast.success("Listing created successfully!");
      onClose();

      // Redirect after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/listings/${listing.id}`);
      }, 1000);
    } catch (error) {
      console.error("[SUBMISSION_ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create listing"
      );
    } finally {
      setIsSubmitting(false);
      setProgress(0);
      setStatus("");
    }
  };

  // Handle additional file uploads
  const handleAdditionalFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [...uploadedPhotos, ...newFiles];

      if (totalFiles.length > 60) {
        toast.error("Maximum 60 photos allowed");
        return;
      }

      const oversizedFiles = newFiles.filter(
        (file) => file.size > 15 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error(
          "Some files are larger than 15MB. Please select smaller files."
        );
        return;
      }

      setUploadedPhotos(totalFiles);
    }
  };

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
                value={inputValue}
                onChange={handleInputChange}
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

            {uploadedPhotos.length > 0 && (
              <PhotoManager
                photos={uploadedPhotos}
                onAddPhotos={handleAdditionalFiles}
                maxPhotos={60}
                listingId={currentListingId}
              />
            )}
            {uploadedPhotos.length === 0 && (
              <label className='relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors'>
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
                  <span className='text-[13px] text-gray-600'>
                    Upload Photos
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

        {/* Generate Button - Fixed to bottom */}
        <div className='bg-white pb-3 px-3 sm:px-4 sm:pb-4'>
          <button
            type='button'
            className='w-full bg-black text-white rounded-lg h-10 sm:h-12 text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50'
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
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
