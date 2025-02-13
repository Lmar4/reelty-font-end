"use client";

import { useToast } from "@/components/common/Toast";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ListingHeader } from "./components/ListingHeader";
import { JobStatusMessage } from "./components/JobStatusMessage";
import { useListing } from "@/hooks/queries/use-listings";
import type { Photo } from "@/types/listing-types";
import type {
  User,
  SubscriptionStatus,
  Listing,
  VideoJob as PrismaVideoJob,
  JsonValue,
  Template,
} from "@/types/prisma-types";
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useTemplates } from "@/hooks/queries/use-templates";
import { useCreateJob } from "@/hooks/use-jobs";

// Extend the Prisma types with our runtime needs
interface VideoJobStatus extends PrismaVideoJob {
  progress: number;
  metadata?: {
    userMessage?: string;
    error?: string;
  };
}

interface ExtendedListing extends Listing {
  currentJobId?: string;
}

interface ListingData {
  id: string;
  currentJobId?: string;
  userId: string;
  address: string;
  description: string | null;
  coordinates: { lat: number; lng: number };
  photos: Photo[];
  videoJobs?: VideoJobStatus[];
  createdAt: Date;
  updatedAt: Date;
  status: string;
  photoLimit: number;
}

interface UserData
  extends Pick<User, "id" | "currentTierId" | "subscriptionStatus"> {}

interface Coordinates {
  lat: number;
  lng: number;
}

function parseCoordinates(value: JsonValue | null): Coordinates | null {
  if (!value || typeof value !== "object") return null;
  const coords = value as Record<string, unknown>;
  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return { lat: coords.lat, lng: coords.lng };
  }
  return null;
}

function useListingData(
  listingId: string,
  initialListing: ExtendedListing
): {
  currentUser: Partial<User> | undefined;
  userData: UserData | undefined;
  listing: ExtendedListing | undefined;
  jobStatus: { status: string; message: string } | null;
  isLoading: boolean;
} {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Transform Clerk user to compatible Partial<User> type
  const currentUser = user
    ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        image: user.imageUrl,
        // Only include createdAt if it exists and convert to Date
        ...(user.createdAt && { createdAt: new Date(user.createdAt) }),
      }
    : undefined;

  // Get user data from backend
  const { data: userData, isLoading: isUserDataLoading } = useQuery<UserData>({
    queryKey: ["user", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error("User ID is required");
      }
      const response = await fetch(`/api/users/${currentUser.id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user data");
      }
      const data = await response.json();
      if (!data.data) {
        throw new Error("No user data returned from API");
      }
      return data.data as UserData;
    },
    enabled: !!currentUser?.id,
    retry: 1, // Solo intentar una vez más si falla
    retryDelay: 1000, // Esperar 1 segundo entre intentos
  });

  const { data: listing } = useListing(listingId, {
    initialData: initialListing,
  });

  // Get job status from the listing's photos
  const jobStatus = useMemo(() => {
    if (!listing?.photos?.length) return null;

    const processingPhotos = listing.photos.filter(
      (p) => !p.processedFilePath && !p.error
    );
    const failedPhotos = listing.photos.filter((p) => p.error);

    if (processingPhotos.length > 0) {
      return {
        status: "PROCESSING",
        message: `Processing ${processingPhotos.length} photos...`,
      };
    }
    if (failedPhotos.length > 0) {
      return {
        status: "ERROR",
        message: `${failedPhotos.length} photos failed to process`,
      };
    }
    return {
      status: "COMPLETED",
      message: "All photos processed successfully",
    };
  }, [listing?.photos]);

  const isLoading = !isUserLoaded || isUserDataLoading || !listing;

  return {
    currentUser,
    userData,
    listing,
    jobStatus,
    isLoading,
  };
}

async function handleRegenerateImages(photoIds: string[]) {
  try {
    const response = await fetch(`/api/photos/regenerate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photoIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || "Failed to regenerate images" };
    }

    return true;
  } catch (error) {
    console.error("[REGENERATE_ERROR]", error);
    return { error: "Failed to regenerate images" };
  }
}

const transformPhotos = (photos: Photo[] | undefined) => {
  if (!photos) return [];

  return photos.map((photo) => ({
    id: photo.id,
    url: photo.processedFilePath || photo.filePath,
    hasError: !!photo.error,
    status: photo.error
      ? ("error" as const)
      : photo.processedFilePath
      ? ("completed" as const)
      : ("processing" as const),
  }));
};

const useVideoJobStatus = (jobId?: string) => {
  const [jobStatus, setJobStatus] = useState<VideoJobStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(`/api/jobs/${jobId}/status`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setJobStatus(data);

        // Close connection when job is completed or failed
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          eventSource.close();
        }
      } catch (err) {
        console.error("[SSE_ERROR]", err);
        setError(
          err instanceof Error ? err : new Error("Failed to parse job status")
        );
      }
    };

    eventSource.onerror = (err) => {
      console.error("[SSE_CONNECTION_ERROR]", err);
      setError(new Error("Failed to connect to status stream"));
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return { data: jobStatus, error, isLoading: !jobStatus && !error };
};

const VideoGenerationProgress = ({ jobId }: { jobId: string }) => {
  const { data: jobStatus, error } = useVideoJobStatus(jobId);

  if (!jobStatus) return null;

  return (
    <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-gray-700'>
          {jobStatus.metadata?.userMessage || "Processing..."}
        </span>
        <span className='text-sm text-gray-500'>{jobStatus.progress}%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full transition-all duration-500'
          style={{ width: `${jobStatus.progress}%` }}
        />
      </div>
      {(error || jobStatus.metadata?.error) && (
        <p className='text-sm text-red-600'>
          {error instanceof Error ? error.message : jobStatus.metadata?.error}
        </p>
      )}
    </div>
  );
};

interface ListingClientProps {
  listingId: string;
  searchParams: { [key: string]: string | string[] | undefined };
  initialListing: ExtendedListing;
}

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
}: ListingClientProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Custom hooks
  const { currentUser, userData, listing, jobStatus, isLoading } =
    useListingData(listingId, initialListing);

  // Video generation mutation
  const { mutate: createVideoJob, isPending: isGeneratingVideo } =
    useCreateJob();

  // Transform photos for the settings modal
  const transformedPhotos = useMemo(
    () => transformPhotos(listing?.photos),
    [listing?.photos]
  );

  // Parse coordinates when needed
  const coordinates = useMemo(
    () => (listing ? parseCoordinates(listing.coordinates) : null),
    [listing]
  );

  const handleImageRegeneration = async (photoIds: string | string[]) => {
    const idsArray = Array.isArray(photoIds) ? photoIds : [photoIds];
    const result = await handleRegenerateImages(idsArray);

    if (result === true) {
      showToast(
        `Image regeneration started for ${idsArray.length} photos`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    } else {
      showToast(result.error || "Failed to regenerate images", "error");
    }
  };

  const handleVideoGeneration = (templateId: string) => {
    if (!listing?.photos?.length) {
      showToast("No photos available for video generation", "error");
      return;
    }

    // Get processed photo paths
    const processedPhotos = listing.photos
      .filter((photo) => photo.processedFilePath && !photo.error)
      .map((photo) => photo.processedFilePath!)
      .filter(Boolean);

    if (!processedPhotos.length) {
      showToast("No processed photos available for video generation", "error");
      return;
    }

    createVideoJob(
      {
        listingId,
        template: templateId,
        inputFiles: processedPhotos,
      },
      {
        onSuccess: () => {
          showToast("Video generation started", "success");
          queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
        },
        onError: (error) => {
          showToast(
            error instanceof Error
              ? error.message
              : "Failed to start video generation",
            "error"
          );
        },
      }
    );
  };

  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
      {/* Header Section */}
      <div className='mb-8'>
        <Link
          href='/dashboard'
          className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 mb-2 inline-block'
        >
          Dashboard
        </Link>
        <span className='text-[15px] text-[#1c1c1c]/60 mx-2'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            className='inline'
          >
            <path
              d='M9 18L15 12L9 6'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </span>
        <Link
          href={`/dashboard/${listingId}`}
          className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 inline-block'
        >
          Your Reels
        </Link>
        <div className='flex items-center justify-between'>
          <h1 className='text-[24px] md:text-[32px] font-semibold text-[#1c1c1c] truncate max-w-[calc(100%-3rem)]'>
            {listing?.address || initialListing.address}
          </h1>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className='w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#f7f7f7] transition-colors flex-shrink-0'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' />
              <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z' />
            </svg>
          </button>
        </div>
        <p className='text-[14px] text-[#1c1c1c]/60 mt-2'>
          Video appear glitchy? Don't worry, it won't when you download it.
        </p>
      </div>

      {isLoading ? (
        <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
          <LoadingState text='Loading data...' size='lg' />
        </div>
      ) : (
        <>
          {jobStatus && <JobStatusMessage status={jobStatus} />}

          {/* Video Jobs Section */}
          {listing?.videoJobs && listing.videoJobs.length > 0 && (
            <div className='space-y-4 mt-8'>
              <h3 className='text-lg font-semibold'>Processing Videos</h3>
              {listing.videoJobs.map((job) => (
                <div key={job.id} className='rounded-lg border p-4'>
                  {job.status === "PROCESSING" ? (
                    <VideoGenerationProgress jobId={job.id} />
                  ) : job.status === "COMPLETED" && job.outputFile ? (
                    <div className='space-y-4'>
                      <video
                        className='w-full rounded-lg'
                        controls
                        src={job.outputFile}
                        poster={
                          listing.photos?.[0]?.processedFilePath || undefined
                        }
                      />
                      <div className='flex justify-end'>
                        <a
                          href={job.outputFile}
                          download
                          className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-black/90'
                        >
                          <svg
                            className='w-4 h-4 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                            />
                          </svg>
                          Download HD
                        </a>
                      </div>
                    </div>
                  ) : job.status === "FAILED" ? (
                    <div className='text-red-600 text-sm'>
                      Video generation failed. Please try again.
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <PropertySettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            address={initialListing.address}
            photos={transformedPhotos}
            onRegenerateImage={handleImageRegeneration}
          />
        </>
      )}
    </div>
  );
}
