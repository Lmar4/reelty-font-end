"use client";

import { useToast } from "@/components/common/Toast";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import { LoadingState } from "@/components/ui/loading-state";
import { useListing } from "@/hooks/queries/use-listings";
import { useTemplates } from "@/hooks/queries/use-templates";
import { useCreateJob } from "@/hooks/use-jobs";
import type { Photo, VideoJob, VideoTemplate } from "@/types/listing-types";
import type { JsonValue, Listing, Template, User } from "@/types/prisma-types";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TemplateGrid } from "./components/TemplateGrid";
import { VideoJobCard } from "./components/VideoJobCard";
import { useVideoStatus } from "@/hooks/queries/use-video-status";
import { usePhotoStatus } from "@/hooks/queries/use-photo-status";

interface ExtendedListing extends Listing {
  currentJobId?: string;
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

  const { data: listing, isLoading: isListingLoading } = useListing(
    listingId,
    initialListing
  );

  const isLoading = !isUserLoaded || isUserDataLoading || !listing;

  return {
    currentUser,
    userData,
    listing,
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

  return photos.map((photo) => {
    // Always prefer processedFilePath if available
    const url = photo.processedFilePath || photo.filePath;

    // If the URL is a full S3 URL with query parameters, extract just the base path
    const cleanUrl = url.includes("?") ? url.split("?")[0] : url;

    return {
      id: photo.id,
      url: cleanUrl,
      hasError: !!photo.error,
      status: photo.error
        ? ("error" as const)
        : photo.processedFilePath
        ? ("completed" as const)
        : ("processing" as const),
    };
  });
};

const transformVideoJob = (job: any): VideoJob => ({
  id: job.id,
  listingId: job.listingId,
  status: job.status,
  progress: job.progress || 0,
  template: job.template,
  inputFiles: job.inputFiles,
  outputFile: job.outputFile,
  thumbnailUrl: job.thumbnailUrl,
  error: job.error || null,
  createdAt: new Date(job.createdAt),
  updatedAt: new Date(job.updatedAt || job.createdAt),
  metadata: {
    userMessage: job.metadata?.userMessage,
    error: job.metadata?.error,
    stage: job.metadata?.stage,
    currentFile: job.metadata?.currentFile,
    totalFiles: job.metadata?.totalFiles,
    startTime: job.metadata?.startTime,
    endTime: job.metadata?.endTime,
  },
});

const VideoGenerationProgress = ({ jobId }: { jobId: string }) => {
  const { data: videoData } = useVideoStatus(jobId);

  // Move early return after the hook
  if (!jobId) return null;

  const jobs = videoData?.videos || [];
  const jobStatus = jobs[0]; // Get the first job if it exists

  if (!jobs.length) {
    return (
      <div className='flex items-center space-x-3'>
        <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
        <p className='text-sm font-medium'>Connecting to video service...</p>
      </div>
    );
  }

  if (!jobStatus) return null;

  // Get stage-specific message
  const getMessage = () => {
    const stage = jobStatus.metadata?.stage;
    switch (stage) {
      case "webp":
        return "Optimizing photos...";
      case "runway":
        return "Applying AI enhancements...";
      case "template":
        return "Applying video template...";
      case "final":
        return "Finalizing video...";
      default:
        return "Processing video...";
    }
  };

  // Get detailed progress info
  const getDetailedProgress = () => {
    const { currentFile, totalFiles } = jobStatus.metadata || {};
    if (currentFile && totalFiles) {
      return `File ${currentFile} of ${totalFiles}`;
    }
    return `${jobStatus.progress}% complete`;
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
          <div>
            <p className='text-sm font-medium'>{getMessage()}</p>
            <p className='text-xs text-gray-500'>{getDetailedProgress()}</p>
          </div>
        </div>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-1.5'>
        <div
          className='bg-blue-500 h-1.5 rounded-full transition-all duration-500'
          style={{ width: `${jobStatus.progress}%` }}
        />
      </div>
    </div>
  );
};

interface ListingClientProps {
  listingId: string;
  searchParams: { [key: string]: string | string[] | undefined };
  initialListing: ExtendedListing;
}

// Transform Prisma Template to VideoTemplate
const transformTemplate = (template: Template): VideoTemplate => ({
  ...template,
  thumbnailUrl: template.thumbnailUrl || undefined,
  tiers: template.tiers || [],
});

interface PhotoStatusResponse {
  processingCount: number;
  failedCount: number;
  totalCount: number;
  photos: {
    id: string;
    url: string;
    hasError: boolean;
    status: "error" | "processing" | "completed";
    order: number;
  }[];
}

const usePhotoProcessingStatus = (listingId: string) => {
  const [status, setStatus] = useState<{
    status: "PROCESSING" | "ERROR" | "COMPLETED" | null;
    message: string;
    photos?: PhotoStatusResponse["photos"];
  } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/listings/${listingId}/photos/status`
        );
        if (!response.ok) throw new Error("Failed to fetch status");

        const data: PhotoStatusResponse = await response.json();

        if (data.processingCount > 0) {
          setStatus({
            status: "PROCESSING",
            message: `Processing ${data.processingCount} of ${data.totalCount} photos...`,
            photos: data.photos,
          });
        } else if (data.failedCount > 0) {
          setStatus({
            status: "ERROR",
            message: `${data.failedCount} photos failed to process`,
            photos: data.photos,
          });
          // Stop polling on error
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (data.totalCount > 0) {
          setStatus({
            status: "COMPLETED",
            message: "All photos processed successfully",
            photos: data.photos,
          });
          // Stop polling when completed
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else {
          setStatus(null);
          // Stop polling when no photos
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (error) {
        console.error("[PHOTO_STATUS_ERROR]", error);
        setStatus({
          status: "ERROR",
          message: "Failed to check photo status",
        });
        // Stop polling on error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // Initial check
    checkStatus();

    // Start polling only if we don't have a status yet
    if (!status) {
      intervalRef.current = setInterval(checkStatus, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [listingId]);

  return status;
};

// Add this helper function near other utility functions
const getValidVideoJobs = (videoJobs: any[] = []) => {
  return videoJobs
    .filter((job) => {
      return (
        job.status === "COMPLETED" &&
        job.outputFile &&
        job.outputFile.includes("s3.us-east-2.amazonaws.com") &&
        job.outputFile.endsWith(".mp4")
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
}: ListingClientProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Custom hooks
  const { currentUser, userData, listing, isLoading } = useListingData(
    listingId,
    initialListing
  );
  const { data: prismaTemplates, isLoading: isLoadingTemplates } =
    useTemplates();

  // Transform templates and video jobs
  const templates = useMemo(
    () => prismaTemplates?.map(transformTemplate),
    [prismaTemplates]
  );

  const { data: videoData } = useVideoStatus(listingId);
  const videoJobs = videoData?.videos || [];

  // Update the latestVideosByTemplate memo
  const latestVideosByTemplate = useMemo(() => {
    const validJobs = getValidVideoJobs(videoJobs);

    const groupedVideos = validJobs.reduce<Record<string, VideoJob>>(
      (acc, job: VideoJob) => {
        if (!job.template) return acc;

        if (
          !acc[job.template] ||
          new Date(acc[job.template].createdAt) < new Date(job.createdAt)
        ) {
          acc[job.template] = job;
        }
        return acc;
      },
      {}
    );

    return Object.values(groupedVideos);
  }, [videoJobs]);

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

  // Get the latest job
  const videoStatus = videoJobs[0];

  // Replace the old photoStatus hook with the new one
  const { data: photoStatus } = usePhotoStatus(listingId);

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
  // console.log("latestVideosByTemplate", latestVideosByTemplate);
  return (
    <div className='container mx-auto py-8 space-y-8'>
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
          href={`/dashboard`}
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
        <LoadingState />
      ) : (
        <>
          {/* Templates and Videos Section */}
          <div className='space-y-8'>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
              {/* Templates */}
              <TemplateGrid
                templates={templates}
                photos={listing?.photos}
                isLoading={isLoadingTemplates}
                userTier={userData?.currentTierId || "free"}
                activeJobs={videoJobs as unknown as VideoJob[]}
                onGenerateVideo={handleVideoGeneration}
              />

              {/* Video Jobs - Now showing only latest per template */}
              {latestVideosByTemplate.map((job) => (
                <VideoJobCard
                  key={job.id}
                  job={job}
                  isPaidUser={userData?.currentTierId !== "free"}
                  onDownload={(jobId: string) => {
                    if (job.outputFile) {
                      window.open(job.outputFile, "_blank");
                    }
                  }}
                  onRegenerate={() => {
                    if (job.template) {
                      handleVideoGeneration(job.template);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <PropertySettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            address={initialListing.address}
            photos={photoStatus?.photos || []}
            onRegenerateImage={handleImageRegeneration}
          />

          {/* Remove the small progress indicator since we have a more prominent one */}
          {/* Only keep the error indicator */}
          {videoStatus?.status === "FAILED" && (
            <div className='fixed bottom-4 right-4 bg-red-50 border border-red-100 rounded-lg p-4 max-w-sm'>
              <p className='text-sm text-red-600'>
                {videoStatus.metadata?.error ||
                  "Video generation failed. Please try again."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
