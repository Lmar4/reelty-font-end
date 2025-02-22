"use client";

import { useToast } from "@/components/common/Toast";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import { useListing } from "@/hooks/queries/use-listings";
import { usePhotoStatus } from "@/hooks/queries/use-photo-status";
import { useVideoStatus } from "@/hooks/queries/use-video-status";
import { useCreateJob } from "@/hooks/use-jobs";
import type { Photo, VideoJob } from "@/types/listing-types";
import type { JsonValue, Listing, User } from "@/types/prisma-types";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TemplateGrid } from "./components/TemplateGrid";
import { VideoJobCard } from "./components/VideoJobCard";
import ListingSkeleton from "./components/ListingSkeleton";

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

interface VideoJobMetadata {
  userMessage?: string;
  error?: string;
  stage?: "webp" | "runway" | "template" | "final" | "initializing";
  currentFile?: number;
  totalFiles?: number;
  startTime?: string;
  endTime?: string;
}

function useListingData(
  listingId: string,
  initialListing: ExtendedListing
): {
  currentUser: Partial<User> | undefined;
  userData: UserData | undefined;
  listing: ExtendedListing | undefined;
  isLoading: boolean;
  error: Error | undefined;
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
  const {
    data: userData,
    isLoading: isUserDataLoading,
    error: userDataError,
  } = useQuery<UserData>({
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

  const {
    data: listing,
    isLoading: isListingLoading,
    error: listingError,
  } = useListing(listingId, initialListing);

  const isLoading = !isUserLoaded || isUserDataLoading || !listing;

  return {
    currentUser,
    userData,
    listing,
    isLoading,
    error: userDataError || listingError || undefined,
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

  if (!jobId) return null;

  const jobs = videoData?.data?.videos || [];
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

const getValidVideoJobs = (videoJobs: VideoJob[] = []) => {
  // Sort by createdAt in descending order (newest first)
  const sortedJobs = videoJobs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Group jobs by their batch (jobs created within 5 minutes of each other)
  const batches: VideoJob[][] = [];
  let currentBatch: VideoJob[] = [];

  sortedJobs.forEach((job) => {
    if (currentBatch.length === 0) {
      currentBatch.push(job);
    } else {
      const firstJobInBatch = currentBatch[0];
      const timeDiff = Math.abs(
        new Date(firstJobInBatch.createdAt).getTime() -
          new Date(job.createdAt).getTime()
      );

      // If within 5 minutes, add to current batch
      if (timeDiff < 300000) {
        // 5 minutes
        currentBatch.push(job);
      } else {
        batches.push([...currentBatch]);
        currentBatch = [job];
      }
    }
  });

  // Add the last batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  // For the most recent batch, if all jobs are completed, show all of them
  const latestBatch = batches[0] || [];
  if (
    latestBatch.length > 0 &&
    latestBatch.every((job) => job.status === "COMPLETED")
  ) {
    return latestBatch;
  }

  // Otherwise, fall back to showing only latest per template
  const latestByTemplate = sortedJobs.reduce<Record<string, VideoJob>>(
    (acc, job) => {
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

  return Object.values(latestByTemplate);
};

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("[ErrorBoundary]", error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className='p-4 rounded-lg bg-red-50 border border-red-100'>
        <h3 className='text-lg font-medium text-red-800'>
          Something went wrong
        </h3>
        <p className='text-sm text-red-600 mt-1'>
          Please try refreshing the page. If the problem persists, contact
          support.
        </p>
        <button
          onClick={() => window.location.reload()}
          className='mt-2 text-sm font-medium text-red-600 hover:text-red-500'
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
}: ListingClientProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Custom hooks with better error handling
  const {
    currentUser,
    userData,
    listing,
    isLoading: isLoadingInitial,
    error: loadingError,
  } = useListingData(listingId, initialListing);

  const {
    data: videoData,
    isLoading: isLoadingVideoJobs,
    error: videoError,
  } = useVideoStatus(listingId);

  const {
    data: photoStatus,
    isLoading: isLoadingPhotoStatus,
    error: photoError,
  } = usePhotoStatus(listingId);

  const {
    mutate: createVideoJob,
    isPending: isGeneratingVideo,
    error: videoGenerationError,
  } = useCreateJob();
  console.log("videoJobs", videoData);
  // Derived state using useMemo
  const videoJobs = useMemo(() => {
    console.log("[VIDEO_JOBS] Raw response:", {
      success: videoData?.success,
      videos: videoData?.data?.videos,
      status: videoData?.data?.status,
    });

    if (videoData?.data?.videos) {
      console.log(
        "[VIDEO_JOBS] Templates in response:",
        videoData.data.videos.map((v) => ({
          id: v.id,
          template: v.template,
          status: v.status,
          createdAt: v.createdAt,
        }))
      );
    }

    return videoData?.data?.videos || [];
  }, [videoData]);

  const latestVideosByTemplate = useMemo(() => {
    console.log("[VIDEO_JOBS] Processing jobs:", {
      totalJobs: videoJobs.length,
      templates: videoJobs.map((v) => v.template),
      statuses: videoJobs.map((v) => v.status),
    });

    const validJobs = getValidVideoJobs(videoJobs);
    console.log("[VIDEO_JOBS] Valid jobs:", {
      totalValidJobs: validJobs.length,
      templates: validJobs.map((v) => v.template),
      statuses: validJobs.map((v) => v.status),
    });

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
    const result = Object.values(groupedVideos);
    console.log("[VIDEO_JOBS] Final grouped videos:", {
      totalFinalJobs: result.length,
      templates: result.map((v) => v.template),
      statuses: result.map((v) => v.status),
    });
    return result;
  }, [videoJobs]);

  // Get the latest job
  const videoStatus = useMemo(() => videoJobs[0], [videoJobs]);

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

  // Optimistic updates for video generation
  const handleVideoGeneration = (templateId: string) => {
    if (!listing?.photos?.length) {
      showToast("No photos available for video generation", "error");
      return;
    }

    const processedPhotos = listing.photos
      .filter((photo) => photo.processedFilePath && !photo.error)
      .map((photo) => photo.processedFilePath!)
      .filter(Boolean);

    if (!processedPhotos.length) {
      showToast("No processed photos available for video generation", "error");
      return;
    }

    // Update the optimistic job to include all required properties
    const optimisticJob: VideoJob = {
      id: `temp-${Date.now()}`,
      listingId,
      template: templateId,
      status: "PROCESSING",
      progress: 0,
      inputFiles: processedPhotos,
      outputFile: null,
      thumbnailUrl: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        stage: "webp",
        userMessage: "Starting video generation...",
      },
    };

    queryClient.setQueryData(["videoJobs", listingId], (old: any) => ({
      ...old,
      data: {
        videos: [optimisticJob, ...(old?.data?.videos || [])],
      },
    }));

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
          // Revert optimistic update
          queryClient.invalidateQueries({ queryKey: ["videoJobs", listingId] });
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

  // Show appropriate loading states
  if (isLoadingInitial) {
    return <ListingSkeleton />;
  }

  // Show error states
  if (loadingError || videoError || photoError) {
    return (
      <div className='container mx-auto py-8'>
        <div className='bg-red-50 border border-red-100 rounded-lg p-4'>
          <h3 className='text-lg font-medium text-red-800'>
            Error loading content
          </h3>
          <p className='text-sm text-red-600 mt-1'>
            {loadingError?.message ||
              videoError?.message ||
              photoError?.message ||
              "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='mt-2 text-sm font-medium text-red-600 hover:text-red-500'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className='container mx-auto py-8 space-y-8'>
        {/* Breadcrumb navigation with better accessibility */}
        <nav aria-label='Breadcrumb' className='mb-8'>
          <ol className='flex items-center space-x-2'>
            <li>
              <Link
                href='/dashboard'
                className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 transition-colors'
                aria-label='Go to Dashboard'
              >
                Dashboard
              </Link>
            </li>
            <li aria-hidden='true' className='text-[#1c1c1c]/60'>
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
            </li>
            <li>
              <Link
                href='/dashboard'
                className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 transition-colors'
                aria-current='page'
              >
                Your Reels
              </Link>
            </li>
          </ol>
        </nav>

        <div className='flex items-center justify-between'>
          <h1 className='text-[24px] md:text-[32px] font-semibold text-[#1c1c1c] truncate max-w-[calc(100%-3rem)]'>
            {listing?.address || initialListing.address}
          </h1>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className='w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#f7f7f7] transition-colors flex-shrink-0'
            aria-label='Open settings'
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
              aria-hidden='true'
            >
              <path d='M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' />
              <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z' />
            </svg>
          </button>
        </div>

        <p className='text-[14px] text-[#1c1c1c]/60 mt-2'>
          Video appear glitchy? Don't worry, it won't when you download it.
        </p>

        {/* Templates and Videos Section with loading states */}
        <div className='space-y-8'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
            {isLoadingVideoJobs ? (
              // Skeleton loader for templates
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='aspect-video bg-gray-100 rounded-lg animate-pulse'
                />
              ))
            ) : (
              <div className='flex flex-col gap-4 md:flex-row'>
                {/* <TemplateGrid
                  videoJobs={videoJobs}
                  photos={listing?.photos}
                  isLoading={isLoadingVideoJobs}
                  userTier={userData?.currentTierId || "free"}
                  activeJobs={videoJobs as unknown as VideoJob[]}
                  onGenerateVideo={handleVideoGeneration}
                  isGenerating={isGeneratingVideo}
                /> */}

                {latestVideosByTemplate.map((job) => (
                  <VideoJobCard
                    listingId={listingId}
                    key={job.id}
                    job={job}
                    isPaidUser={userData?.currentTierId !== "free"}
                    onDownload={async (jobId: string) => {
                      if (job.outputFile) {
                        try {
                          const response = await fetch(job.outputFile);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          const filename = `${listing?.address || "property"}-${
                            job.template || "video"
                          }.mp4`;
                          link.setAttribute("download", filename);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Download failed:", error);
                          // Fallback to opening in new tab if download fails
                          window.open(job.outputFile, "_blank");
                        }
                      }
                    }}
                    onRegenerate={() => {
                      if (job.template) {
                        handleVideoGeneration(job.template);
                      }
                    }}
                    isRegenerating={isGeneratingVideo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <PropertySettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          address={initialListing.address}
          photos={photoStatus?.photos || []}
          onRegenerateImage={handleImageRegeneration}
          isLoading={isLoadingPhotoStatus}
        />

        {/* Error Toast */}
        {videoStatus?.status === "FAILED" && (
          <div
            role='alert'
            className='fixed bottom-4 right-4 bg-red-50 border border-red-100 rounded-lg p-4 max-w-sm shadow-lg animate-fade-in'
          >
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-600'>
                  {videoStatus.metadata?.error ||
                    "Video generation failed. Please try again."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
