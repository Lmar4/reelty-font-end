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
import { cn } from "@/lib/utils";
import { ListingFormData, listingFormSchema } from "@/lib/validations/listing";
import { makeBackendRequest } from "@/utils/withAuth";
import { useAuth, useSession } from "@clerk/nextjs";
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
import PricingCards from "./PricingCards";
import { usePhotoStatus } from "@/hooks/queries/use-photo-status";
import { LoadingState } from "@/components/ui/loading-state";
import dynamic from "next/dynamic";
import { useUserData } from "@/hooks/useUserData";
import { SubscriptionTier } from "@/constants/subscription-tiers";

// Initialize Google Maps loader
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  version: "weekly",
  libraries: ["places"],
});

// Add environment variable for S3 bucket
const S3_BUCKET_NAME =
  process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "reelty-prod-storage";

// Add environment variable for S3 bucket URL
const S3_BUCKET_URL = `https://${S3_BUCKET_NAME}.s3.amazonaws.com`;

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: File[];
  initialAddress?: string;
  initialCoordinates?: {
    lat: number;
    lng: number;
  };
  tempListingId?: string;
  maxPhotos?: number;
}

interface StoredPhoto {
  uiId: string;
  s3Key: string;
  url: string;
  bucket?: string;
  filePath?: string;
}

// First, let's define an interface for the upload result type
interface UploadResult {
  s3Key: string;
  url: string;
}

export default function NewListingModal({
  isOpen,
  onClose,
  initialFiles = [],
  initialAddress = "",
  initialCoordinates,
  tempListingId,
  maxPhotos = 60, // Default to 60 if not specified
}: NewListingModalProps) {
  const { userId, isSignedIn, isLoaded: authLoaded } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const createListing = useCreateListing();
  const uploadPhoto = useUploadPhoto();
  const photoProcessing = usePhotoProcessing();
  const { data: userData } = useUserData();

  // Photo processing hook with status and progress
  const {
    processPhotos,
    cleanup,
    status: processingStatus,
    progress: processingProgress,
  } = usePhotoProcessing();

  const { sessionData, savePhotos, saveAddress, clearSession } =
    useListingSession();
  const uploadToS3 = useS3Upload();

  const [processedPhotos, setProcessedPhotos] = useState<ProcessedPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [limitError, setLimitError] = useState<{
    currentTier: string;
    maxAllowed: number;
  } | null>(null);

  // Add these new states
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [showProcessingState, setShowProcessingState] = useState(false);

  // Photo status hook - will only be enabled when we have a listing ID and are showing processing
  const photoStatus = usePhotoStatus(createdListingId || "");

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      address: initialAddress || "",
      coordinates: initialCoordinates || {
        lat: 0,
        lng: 0,
      },
      photoLimit: 1,
    },
    mode: "onChange",
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

  // Create a consistent function to check if user is on free tier
  const isFreeUser = () => userData?.currentTierId === SubscriptionTier.FREE;
  const getMaxSelectablePhotos = () => (isFreeUser() ? 10 : 20);
  const getMaxUploadablePhotos = () => (isFreeUser() ? 20 : 60);

  // Process initial files
  useEffect(() => {
    if (initialFiles?.length > 0) {
      const maxSelectablePhotos = getMaxSelectablePhotos();

      // Just create preview URLs initially without processing
      Promise.all(
        initialFiles.map(async (file) => {
          const processedPhoto = (
            await photoProcessing.processPhotos([file])
          )[0];
          return {
            id:
              Date.now().toString(36) + Math.random().toString(36).substring(2),
            originalFile: file,
            webpBlob: processedPhoto.webpBlob,
            previewUrl: URL.createObjectURL(file),
            status: "idle" as const,
          };
        })
      ).then((photos) => {
        const processedPhotos = photos.map((photo) => ({
          ...photo,
          uiId: photo.id, // Map id to uiId
        }));
        setProcessedPhotos(processedPhotos);
        // Auto-select first 10 or 20 photos based on user tier
        setSelectedPhotos(
          new Set(
            processedPhotos
              .slice(0, maxSelectablePhotos)
              .map((photo) => photo.uiId)
          )
        );
      });
    }
  }, [initialFiles, userData]);

  // Handle modal state
  useEffect(() => {
    const resetForm = () => {
      form.reset({
        address: "",
        coordinates: undefined,
      });
      setInputValue("");
    };

    if (!isOpen) {
      // Cleanup when closing
      cleanup(processedPhotos);
      setProcessedPhotos([]);
      setSelectedPhotos(new Set());
      resetForm();
    } else if (!initialFiles?.length) {
      // Clear everything when opening a new modal
      clearSession();
      setProcessedPhotos([]);
      setSelectedPhotos(new Set());
      resetForm();
    }
  }, [isOpen, initialFiles?.length]);

  // Handle session restoration
  useEffect(() => {
    // Wait for auth to be ready
    if (!authLoaded) return;

    try {
      // Get session ID from URL if present
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session");

      if (sessionId && sessionData) {
        const photos = sessionData.photos;
        if (!Array.isArray(photos) || photos.length === 0) {
          return;
        }

        // Create ProcessedPhoto objects from the stored photos
        const restoredPhotos: ProcessedPhoto[] = (photos as StoredPhoto[]).map(
          (photo) => ({
            uiId: crypto.randomUUID(),
            originalFile: new File([], `${photo.s3Key}.webp`),
            webpBlob: new Blob([], { type: "image/webp" }),
            previewUrl: photo.url,
            s3Key: photo.s3Key,
            status: "uploaded" as const,
          })
        );

        setProcessedPhotos(restoredPhotos);
        setSelectedPhotos(new Set(restoredPhotos.map((p) => p.uiId)));

        // Restore form values
        if (sessionData.address) {
          setInputValue(sessionData.address);
          form.setValue("address", sessionData.address);
        }

        if (sessionData.coordinates) {
          form.setValue("coordinates", sessionData.coordinates);
        }

        // Clear the session ID from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    } catch (error) {
      console.error("Error restoring session:", error);
      clearSession();
    }
  }, [authLoaded, sessionData, form]);

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

      // Determine max uploadable photos based on user tier
      const userTier = userData?.currentTier;
      const isFreeUser = userTier?.name === "FREE" || !userTier;
      const maxUploadablePhotos = isFreeUser ? 20 : 60;
      const maxSelectablePhotos = isFreeUser ? 10 : 20;

      // Validate total files first
      const existingFiles = processedPhotos || [];
      const totalFiles = [...existingFiles, ...newFiles];

      if (totalFiles.length > maxUploadablePhotos) {
        toast.error(
          `Maximum ${maxUploadablePhotos} photos can be uploaded on your plan`
        );
        return;
      }

      // Validate file sizes
      const oversizedFiles = newFiles.filter(
        (file) => file.size > 20 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error(
          "Some files are larger than 20MB. Please select smaller files."
        );
        return;
      }

      // Process new files
      const newProcessedPhotos = await Promise.all(
        newFiles.map(async (file) => {
          const processedPhoto = (
            await photoProcessing.processPhotos([file])
          )[0];
          return {
            uiId: crypto.randomUUID(), // Changed from id to uiId
            originalFile: file,
            webpBlob: processedPhoto.webpBlob,
            previewUrl: URL.createObjectURL(file),
            status: "idle" as const,
          } satisfies ProcessedPhoto; // Add type assertion
        })
      );

      // Update state with new photos
      setProcessedPhotos((current) => [...current, ...newProcessedPhotos]);
    }
  };

  const handleSubmit = async (data: ListingFormData) => {
    let uploadResults: any = null; // Define uploadResults at the top level of the function
    try {
      setIsSubmitting(true);
      setProgress(0);
      setStatus("Creating listing...");

      // Get token early
      const token = await session?.getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Update photo limit check based on trial status
      const requiredPhotos = 10;

      if (selectedPhotos.size < requiredPhotos) {
        toast.error("Please select at least 10 photos");
        return;
      }

      if (selectedPhotos.size > maxPhotos) {
        toast.error(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      if (!data.address || !data.coordinates) {
        toast.error("Please enter a valid address");
        return;
      }

      // Reset progress and status
      setProgress(0);
      setIsSubmitting(true);

      // Filter and sort selected photos
      const selectedPhotoFiles = Array.from(selectedPhotos)
        .map((uiId) => processedPhotos.find((p) => p.uiId === uiId))
        .filter((p): p is ProcessedPhoto => p !== undefined);

      // If not signed in, save redirect info first
      if (!userId || !isSignedIn) {
        // Generate a UUID for the temp upload
        const tempUploadId = crypto.randomUUID();

        // Save complete form state with correct photo structure
        savePhotos(
          selectedPhotoFiles.map((photo) => ({
            uiId: photo.uiId,
            s3Key: "", // Will be populated after actual upload
            url: photo.previewUrl, // Use preview URL temporarily
            bucket: S3_BUCKET_NAME, // Add bucket name
          }))
        );

        if (data.address && data.coordinates) {
          saveAddress(data.address, data.coordinates);
        }

        // Save the redirect path with temp upload ID
        sessionStorage.setItem(
          "postSignUpRedirect",
          `/dashboard/listings/${tempUploadId}?temp=true`
        );
      }

      // If we have a session with already uploaded photos, use those
      if (
        sessionData &&
        Array.isArray(sessionData.photos) &&
        sessionData.photos.length > 0
      ) {
        uploadResults = sessionData.photos;
        setProgress(30);
      } else {
        // 1. Process photos to webp (20%)
        setStatus("Processing photos...");
        setProgress(10);
        const files = selectedPhotoFiles.map((p) => p.originalFile);
        const processedFiles = await processPhotos(files);
        setProgress(20);

        // 2. Upload to S3 (20% -> 40%)
        setStatus("Uploading photos...");
        const uploadStartProgress = 20;
        const uploadEndProgress = 40;

        // Create progress callback
        const onUploadProgress = (progress: number) => {
          const scaledProgress =
            uploadStartProgress +
            (progress * (uploadEndProgress - uploadStartProgress)) / 100;
          setProgress(Math.round(scaledProgress));
        };

        // Update S3 path construction to use consistent format
        const getS3Key = (file: File) => {
          const timestamp = Date.now();
          return `properties/${userId}/listings/${timestamp}-${file.name}.webp`;
        };

        // Update file upload logic
        const filesToUpload = processedFiles.map(
          (photo) =>
            new File(
              [photo.webpBlob],
              getS3Key(photo.originalFile), // Use consistent naming
              { type: "image/webp" }
            )
        );

        // Upload to S3 with consistent paths
        try {
          uploadResults = await uploadToS3(
            filesToUpload,
            true,
            onUploadProgress
          );

          // Log upload results for debugging
          console.log("[LISTING_CREATION] Upload results:", {
            resultsType: typeof uploadResults,
            isArray: Array.isArray(uploadResults),
            length: Array.isArray(uploadResults) ? uploadResults.length : "N/A",
            results: uploadResults,
          });

          // Ensure uploadResults is an array
          if (!Array.isArray(uploadResults)) {
            console.error(
              "[LISTING_CREATION] Upload results is not an array:",
              uploadResults
            );
            uploadResults = [];
            throw new Error(
              "Upload failed: Invalid response format from server"
            );
          }

          if (uploadResults.length === 0) {
            throw new Error("No files were uploaded successfully");
          }
        } catch (uploadError) {
          console.error("[LISTING_CREATION] Upload error:", uploadError);
          uploadResults = [];
          throw new Error(
            uploadError instanceof Error
              ? `Upload failed: ${uploadError.message}`
              : "Upload failed: Unknown error"
          );
        }

        // 2. Verify uploads completed successfully
        setStatus("Verifying uploads...");
        let verificationAttempts = 0;
        const maxVerificationAttempts = 3;
        const verificationDelay = 1000; // 1 second delay between attempts

        while (verificationAttempts < maxVerificationAttempts) {
          try {
            await makeBackendRequest<void>("/api/photos/verify", {
              method: "POST",
              sessionToken: token,
              body: {
                photos: Array.isArray(uploadResults)
                  ? uploadResults.map((result: UploadResult) => ({
                      s3Key: result.s3Key,
                    }))
                  : [],
              },
            });
            // If verification succeeds, break out of the loop
            break;
          } catch (error) {
            verificationAttempts++;
            console.error(
              `Upload verification attempt ${verificationAttempts} failed:`,
              error
            );

            if (verificationAttempts === maxVerificationAttempts) {
              throw new Error(
                "Failed to verify photo uploads after multiple attempts. Please try again."
              );
            }

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, verificationDelay)
            );
            setStatus(
              `Retrying verification (attempt ${
                verificationAttempts + 1
              }/${maxVerificationAttempts})...`
            );
          }
        }

        // Save metadata to session
        savePhotos(
          Array.isArray(uploadResults)
            ? uploadResults.map((result: UploadResult) => ({
                uiId: crypto.randomUUID(),
                s3Key: result.s3Key,
                url: `${S3_BUCKET_URL}/${result.s3Key}`,
                bucket: S3_BUCKET_NAME,
              }))
            : []
        );
      }

      // If not signed in, redirect now that everything is saved
      if (!userId || !isSignedIn) {
        router.push("/sign-up");
        return;
      }

      // 3. Create listing with the uploaded photo information
      const listingData = {
        ...data,
        photoLimit: selectedPhotos.size,
        photos: Array.isArray(uploadResults)
          ? uploadResults.map((result: UploadResult) => ({
              s3Key: result.s3Key,
            }))
          : [],
      };

      const createdListing = await createListing.mutateAsync(listingData);

      // Save the created listing ID
      setCreatedListingId(createdListing.id);

      // 4. Trigger photo processing with verified photos
      setStatus("Processing photos...");
      setProgress(80);

      await makeBackendRequest<void>(
        `/api/listings/${createdListing.id}/process-photos`,
        {
          method: "POST",
          sessionToken: token,
          body: {
            photos: Array.isArray(uploadResults)
              ? uploadResults.map((result: UploadResult) => ({
                  s3Key: result.s3Key,
                }))
              : [],
          },
        }
      );

      setProgress(100);
      setStatus("Complete!");

      // Clear all form and session data
      clearSession();
      form.reset();
      setInputValue("");
      setProcessedPhotos([]);
      setSelectedPhotos(new Set());

      toast.success("Listing created successfully!");

      // Instead of redirecting, show the processing state
      setShowProcessingState(true);
    } catch (error) {
      setIsSubmitting(false);
      setProgress(0);
      setStatus("");

      // Log detailed error information
      console.error("[LISTING_CREATION] Error details:", {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        data,
        selectedPhotos: selectedPhotos.size,
        uploadResultsType: typeof uploadResults,
        uploadResultsIsArray: Array.isArray(uploadResults),
      });

      // Ensure uploadResults is always an array to prevent "e is not iterable" error
      if (!Array.isArray(uploadResults)) {
        uploadResults = [];
      }

      // Check if it's a listing limit error
      if (typeof error === "object" && error !== null && "limitData" in error) {
        const { limitData } = error as {
          limitData?: { currentTier: string; maxAllowed: number };
        };
        if (limitData) {
          setLimitError(limitData);
          setShowPricingModal(true);
          return;
        }
      }

      // Handle other errors
      let errorMessage = "Failed to create listing";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = (error as { message: string }).message;
      }

      toast.error(errorMessage);
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

  if (showPricingModal) {
    return (
      <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-center'>
              Upgrade Your Plan
            </h2>
            <p className='text-gray-600 text-center mt-2'>
              You've reached the limit of {limitError?.maxAllowed} active
              listings on your {limitError?.currentTier} plan. Upgrade to create
              more listings!
            </p>
          </div>
          <PricingCards
            isModal={true}
            onUpgradeComplete={() => {
              setShowPricingModal(false);
              onClose();
            }}
          />
          <button
            onClick={() => setShowPricingModal(false)}
            className='mt-6 w-full text-gray-600 hover:text-gray-800'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show processing state if needed
  if (showProcessingState && createdListingId) {
    const status = photoStatus.data?.data;

    return (
      <div
        className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto'
        onClick={(e) => {
          // Prevent closing if still processing
          if (status?.status !== "PROCESSING") {
            handleBackdropClick(e);
          }
        }}
      >
        <div className='bg-white rounded-lg max-w-[500px] w-[calc(100%-2rem)] p-6 relative mx-auto flex flex-col overflow-hidden'>
          <h2 className='text-[24px] font-semibold text-black mb-4'>
            Processing Your Listing
          </h2>

          {photoStatus.isLoading ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <LoadingState size='lg' />
              <p className='mt-4 text-gray-600'>
                Checking processing status...
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <p className='text-gray-700'>
                  {status?.message || "Your listing is being processed..."}
                </p>

                <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-green-500 transition-all duration-300'
                    style={{
                      width:
                        status?.processingCount === 0
                          ? "100%"
                          : `${
                              100 -
                              ((status?.processingCount || 0) /
                                (status?.totalCount || 1)) *
                                100
                            }%`,
                    }}
                  />
                </div>

                <p className='text-sm text-gray-500'>
                  {status?.processingCount === 0
                    ? "All photos processed! Your reels are being generated."
                    : `Processed ${
                        (status?.totalCount || 0) -
                        (status?.processingCount || 0)
                      } of ${status?.totalCount || 0} photos`}
                </p>
              </div>

              {status?.status === "ERROR" && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm'>
                  Some photos encountered errors during processing. Don't worry,
                  we're still working on your listing.
                </div>
              )}

              {status?.status === "COMPLETED" && (
                <div className='p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm'>
                  Processing complete! Your listing reels have been generated
                  successfully.
                </div>
              )}

              <div className='flex justify-end gap-3 mt-2'>
                {status?.status !== "PROCESSING" && (
                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/dashboard/listings/${createdListingId}`);
                    }}
                    className='bg-black text-white rounded-lg px-4 py-2 text-sm font-medium'
                  >
                    View Listing
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    if (status?.status !== "PROCESSING") {
                      router.refresh();
                    }
                  }}
                  className='border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium'
                  disabled={status?.status === "PROCESSING"}
                >
                  {status?.status === "PROCESSING" ? "Processing..." : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto sm:overflow-visible'
      onClick={handleBackdropClick}
    >
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(handleSubmit)(e);
          }}
          method='POST'
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
                                {data.map(
                                  ({
                                    place_id,
                                    description,
                                  }: {
                                    place_id: string;
                                    description: string;
                                  }) => (
                                    <li
                                      key={place_id}
                                      onClick={() => handleSelect(description)}
                                      className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                    >
                                      {description}
                                    </li>
                                  )
                                )}
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
                    <span>
                      {selectedPhotos.size} of{" "}
                      {userData?.currentTier?.name === "FREE" ||
                      !userData?.currentTier
                        ? 10
                        : 20}{" "}
                      photos selected
                    </span>
                    <span>
                      {Math.round(
                        (selectedPhotos.size /
                          (userData?.currentTier?.name === "FREE" ||
                          !userData?.currentTier
                            ? 10
                            : 20)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        selectedPhotos.size < 10
                          ? "bg-red-500"
                          : selectedPhotos.size >
                            (userData?.currentTier?.name === "FREE" ||
                            !userData?.currentTier
                              ? 10
                              : 20)
                          ? "bg-red-500"
                          : "bg-purple-500"
                      )}
                      style={{
                        width: `${
                          (selectedPhotos.size /
                            (userData?.currentTier?.name === "FREE" ||
                            !userData?.currentTier
                              ? 10
                              : 20)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  {selectedPhotos.size < 10 && (
                    <p className='text-red-500 text-sm mt-1'>
                      Please select at least 10 photos
                    </p>
                  )}
                  {selectedPhotos.size >
                    (userData?.currentTier?.name === "FREE" ||
                    !userData?.currentTier
                      ? 10
                      : 20) && (
                    <p className='text-red-500 text-sm mt-1'>
                      Maximum{" "}
                      {userData?.currentTier?.name === "FREE" ||
                      !userData?.currentTier
                        ? 10
                        : 20}{" "}
                      photos allowed
                    </p>
                  )}
                  {userData?.currentTier?.name === "FREE" && (
                    <p className='text-gray-500 text-sm mt-1'>
                      Free users must select exactly 10 photos
                    </p>
                  )}
                  {!userData?.currentTier && (
                    <p className='text-gray-500 text-sm mt-1'>
                      Paid users can select between 10-20 photos
                    </p>
                  )}
                </div>
              </div>

              {processedPhotos.length > 0 && (
                <PhotoManager
                  photos={processedPhotos}
                  onAddPhotos={handleAdditionalFiles}
                  maxPhotos={getMaxSelectablePhotos()}
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
                selectedPhotos.size < 10 ||
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
                  Generate Reels
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
