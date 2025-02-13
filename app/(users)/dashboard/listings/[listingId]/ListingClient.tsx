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

// Add template type definition
interface Template {
  id: string;
  name: string;
  image: string;
  isPro?: boolean;
}

// Add mock templates (we'll replace this with real data later)
const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
  },
  {
    id: "modern",
    name: "Modern Minimalist",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
  },
  {
    id: "warm",
    name: "Warm & Inviting",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  },
  {
    id: "google-earth",
    name: "Google Earth",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    isPro: true,
  },
  {
    id: "x-city",
    name: "$X in Y City",
    image: "https://images.unsplash.com/photo-1545156521-77bd85671d30",
    isPro: true,
  },
  {
    id: "reelty-core",
    name: "Reelty Core",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    isPro: true,
  },
];

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

          {/* Templates Grid */}
          <div className='-mx-2 md:mx-0'>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0'>
              {templates.map((template) => (
                <div
                  key={template.id}
                  className='bg-white rounded-lg overflow-hidden shadow-sm'
                >
                  <div className='relative aspect-[9/16] overflow-hidden'>
                    <Image
                      src={template.image}
                      alt={template.name}
                      fill
                      className='object-cover'
                    />
                    {/* Reelty Watermark */}
                    <div className='absolute bottom-[20%] left-1/2 -translate-x-1/2 flex items-center'>
                      <Image
                        src='/images/logo-cutout.svg'
                        alt='Reelty'
                        width={120}
                        height={40}
                        className='opacity-40 brightness-0 invert'
                      />
                    </div>
                    {template.isPro && (
                      <div className='absolute inset-0 bg-black/50' />
                    )}
                  </div>
                  <div className='p-3 md:p-4 bg-[#ebebeb]'>
                    <div className='flex items-center justify-between mb-3 md:mb-4'>
                      <h3 className='text-[13px] md:text-[15px] font-bold text-[#1c1c1c]'>
                        {template.name}
                      </h3>
                      {template.isPro && (
                        <span className='text-[11px] md:text-[13px] font-medium bg-black text-white px-2 py-0.5 rounded'>
                          Pro
                        </span>
                      )}
                    </div>
                    <button
                      className={`w-full rounded-lg py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium transition-colors ${
                        template.isPro
                          ? "bg-[#d1d1d1] text-[#1c1c1c]/40 cursor-not-allowed"
                          : "bg-black text-white hover:bg-black/90"
                      }`}
                      disabled={template.isPro}
                    >
                      Download HD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Jobs Section */}
          {listing?.videoJobs && listing.videoJobs.length > 0 && (
            <div className='space-y-4 mt-8'>
              <h3 className='text-lg font-semibold'>Processing Videos</h3>
              {listing.videoJobs.map((job) => (
                <div key={job.id} className='rounded-lg border p-4'>
                  {job.status === "PROCESSING" ? (
                    <VideoGenerationProgress jobId={job.id} />
                  ) : job.status === "COMPLETED" && job.outputFile ? (
                    <video
                      className='w-full rounded-lg'
                      controls
                      src={job.outputFile}
                      poster={
                        listing.photos?.[0]?.processedFilePath || undefined
                      }
                    />
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
