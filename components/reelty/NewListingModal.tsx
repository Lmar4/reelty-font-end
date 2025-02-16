"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateListing, useUploadPhoto } from "@/hooks/queries/use-listings";
import { useListingSession } from "@/hooks/use-listing-session";
import {
  ProcessedPhoto,
  usePhotoProcessing,
} from "@/hooks/use-photo-processing";
import { useS3Upload } from "@/hooks/use-s3-upload";
import { ListingFormData, listingFormSchema } from "@/lib/validations/listing";
import { useAuth } from "@clerk/nextjs";
import { Loader } from "@googlemaps/js-api-loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import PhotoManager from "./PhotoManager";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

interface StoredPhoto {
  id: string;
  s3Key: string;
  url: string;
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

  // Photo processing hook with status and progress
  const {
    processPhotos,
    cleanup,
    status: processingStatus,
    progress: processingProgress,
  } = usePhotoProcessing();

  const { sessionData, savePhotos, saveAddress, clearSession } =
    useListingSession();
  const { uploadToS3, isUploading, uploadProgress } = useS3Upload();

  const [processedPhotos, setProcessedPhotos] = useState<ProcessedPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      address: "",
      coordinates: null,
      photoLimit: 1,
    },
  });

  // Load Google Maps
  useEffect(() => {
    setMapsLoading(true);
    loader
      .load()
      .then(() => {
        setIsLoaded(true);
        setMapsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        toast.error("Error loading Google Maps");
        setMapsLoading(false);
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

  // Process initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      // Just create preview URLs initially without processing
      Promise.all(
        initialFiles.map(async (file) => ({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          originalFile: file,
          webpBlob: file, // We'll process this later
          previewUrl: URL.createObjectURL(file),
          status: "idle" as const,
        }))
      ).then((photos) => {
        setProcessedPhotos(photos);
        // Auto-select first 10 photos
        setSelectedPhotos(
          new Set(photos.slice(0, 10).map((photo) => photo.id))
        );
      });
    }
  }, [initialFiles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup(processedPhotos);
    };
  }, [cleanup, processedPhotos]);

  // Restore session if exists
  useEffect(() => {
    if (!sessionData) {
      return;
    }

    const photos = sessionData.photos;
    if (!Array.isArray(photos) || photos.length === 0) {
      return;
    }

    try {
      // Create ProcessedPhoto objects from the stored photos
      const restoredPhotos: ProcessedPhoto[] = photos.map(
        (photo: StoredPhoto) => ({
          id: photo.id,
          originalFile: new File([], `${photo.id}.webp`), // Placeholder file
          webpBlob: new Blob([], { type: "image/webp" }), // Placeholder blob
          previewUrl: photo.url,
          s3Key: photo.s3Key,
          status: "uploaded" as const,
        })
      );

      setProcessedPhotos(restoredPhotos);
      setSelectedPhotos(new Set(restoredPhotos.map((p) => p.id)));

      if (typeof sessionData.address === "string") {
        setInputValue(sessionData.address);
        form.setValue("address", sessionData.address);
      }

      if (
        sessionData.coordinates &&
        typeof sessionData.coordinates.lat === "number" &&
        typeof sessionData.coordinates.lng === "number"
      ) {
        form.setValue("coordinates", sessionData.coordinates);
      }
    } catch (error) {
      console.error("Error restoring session:", error);
      clearSession();
    }
  }, [sessionData, form, clearSession]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setPlacesValue(value);
  };

  const handleSelect = async (description: string) => {
    setInputValue(description);
    setPlacesValue(description, false);
    clearSuggestions();
    form.setValue("address", description);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      form.setValue("coordinates", { lat, lng });
    } catch (error) {
      console.error("Error getting geocode:", error);
      toast.error("Error getting location coordinates");
      form.setError("coordinates", {
        type: "manual",
        message: "Failed to get coordinates",
      });
    }
  };

  // Handle additional file uploads
  const handleAdditionalFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [
        ...processedPhotos.map((p) => p.originalFile),
        ...newFiles,
      ];

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

      // Just create preview URLs initially without processing
      const newPhotos = await Promise.all(
        newFiles.map(async (file) => ({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          originalFile: file,
          webpBlob: file, // We'll process this later
          previewUrl: URL.createObjectURL(file),
          status: "idle" as const,
        }))
      );

      setProcessedPhotos([...processedPhotos, ...newPhotos]);
      // Auto-select first 10 photos if none are selected
      if (selectedPhotos.size === 0) {
        setSelectedPhotos(new Set(newPhotos.slice(0, 10).map((p) => p.id)));
      }
    }
  };

  const handleSubmit = async (data: ListingFormData) => {
    if (selectedPhotos.size === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    if (!userId || !isSignedIn) {
      // Filter and sort selected photos
      const selectedPhotoFiles = Array.from(selectedPhotos)
        .map((id) => processedPhotos.find((p) => p.id === id))
        .filter((p): p is ProcessedPhoto => p !== undefined);

      // Save photos to temporary storage
      const uploadResults = await uploadToS3(selectedPhotoFiles, true);

      // Save session data
      savePhotos(
        uploadResults.map((result) => ({
          id: result.id,
          s3Key: result.s3Key,
          url: result.url,
        }))
      );

      // Save address data
      if (data.address && data.coordinates) {
        saveAddress(data.address, data.coordinates);
      }

      sessionStorage.setItem("postSignUpRedirect", "/dashboard/new-listing");
      router.push("/sign-up");
      return;
    }

    try {
      setIsSubmitting(true);
      setProgress(0);
      setStatus("Processing photos...");

      // Filter and sort selected photos
      const selectedPhotoFiles = Array.from(selectedPhotos)
        .map((id) => processedPhotos.find((p) => p.id === id))
        .filter((p): p is ProcessedPhoto => p !== undefined);

      let processedResults: ProcessedPhoto[] = [];

      // If we have a session, use the already uploaded photos
      if (sessionData) {
        processedResults = selectedPhotoFiles;
        setProgress(30);
      } else {
        // Process photos
        const totalPhotos = selectedPhotoFiles.length;
        for (let i = 0; i < selectedPhotoFiles.length; i++) {
          setStatus(`Processing photo ${i + 1} of ${totalPhotos}`);
          const photo = selectedPhotoFiles[i];
          try {
            const processedPhoto = await processPhotos([photo.originalFile]);
            processedResults.push(processedPhoto[0]);
          } catch (error) {
            console.error(`Error processing photo ${i + 1}:`, error);
            toast.error(`Failed to process photo ${i + 1}`);
          }
          setProgress(Math.floor(((i + 1) / totalPhotos) * 30));
        }

        // Upload photos to S3
        setStatus("Uploading photos to S3...");
        const uploadResults = await uploadToS3(processedResults);

        // Update processed results with S3 keys
        processedResults = processedResults.map((photo, index) => ({
          ...photo,
          s3Key: uploadResults[index].s3Key,
        }));
      }

      setProgress(60);
      setStatus("Creating listing...");

      // Create listing with photo references
      const listing = await createListing.mutateAsync({
        ...data,
        photoLimit: selectedPhotos.size,
      });

      if (!listing?.id) {
        throw new Error("Failed to create listing - no listing ID returned");
      }

      // Link photos to listing
      setStatus("Linking photos to listing...");
      for (let i = 0; i < processedResults.length; i++) {
        const photo = processedResults[i];
        if (!photo.s3Key) {
          throw new Error(`Missing S3 key for photo ${i + 1}`);
        }

        await uploadPhoto.mutateAsync({
          file: photo.originalFile,
          listingId: listing.id,
          order: i,
          s3Key: photo.s3Key,
        });
        setProgress(60 + Math.floor(((i + 1) / processedResults.length) * 40));
      }

      setProgress(100);
      setStatus("Complete!");

      // Clear the session if it exists
      clearSession();

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

      if (error instanceof Error && error.message.includes("address")) {
        form.setError("address", {
          type: "manual",
          message: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
      setProgress(0);
      setStatus("");
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='bg-white rounded-lg max-w-[900px] w-[calc(100%-2rem)] max-h-[80vh] sm:max-h-[90vh] relative mx-auto flex flex-col overflow-hidden'
        >
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
            {/* Photo Selection Section */}
            <div className='p-4'>
              <div className='flex flex-col gap-3 mb-4'>
                <h2 className='text-[24px] font-semibold text-black'>
                  New Listing Reels
                </h2>

                {/* Address Input Section */}
                <div className='mb-4'>
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=' text-[18px] font-semibold  text-black'>
                          Listing Address
                          <span className='text-red-500 ml-1'>*</span>
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              {...field}
                              value={inputValue}
                              onChange={(e) => {
                                field.onChange(e);
                                handleInputChange(e);
                              }}
                              disabled={!ready || !isLoaded}
                              placeholder={
                                mapsLoading
                                  ? "Loading Google Maps..."
                                  : "Enter listing address (required)"
                              }
                              className={cn("w-full", {
                                "animate-pulse": mapsLoading,
                                "bg-gray-100": mapsLoading,
                                "border-red-300 focus:border-red-500":
                                  form.formState.errors.address,
                              })}
                              aria-required='true'
                              required
                            />
                            {mapsLoading && (
                              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                <svg
                                  className='animate-spin h-5 w-5 text-gray-400'
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
                              </div>
                            )}
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
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

              {processedPhotos.length > 0 && (
                <PhotoManager
                  photos={processedPhotos}
                  onAddPhotos={handleAdditionalFiles}
                  maxPhotos={60}
                  onSelect={(ids) => setSelectedPhotos(new Set(ids))}
                  selectedIds={Array.from(selectedPhotos)}
                />
              )}
              {processedPhotos.length === 0 && (
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
              type='submit'
              className='w-full bg-black text-white rounded-lg h-10 sm:h-12 text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50'
              disabled={
                isSubmitting ||
                selectedPhotos.size === 0 ||
                !form.getValues("address")
              }
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
            {isSubmitting && (
              <div className='mt-2'>
                <div className='h-1 bg-gray-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-green-500 transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
