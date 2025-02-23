"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useToast } from "@/components/common/Toast";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import { useListing } from "@/hooks/queries/use-listings";
import { usePhotoStatus } from "@/hooks/queries/use-photo-status";
import { useVideoStatus } from "@/hooks/queries/use-video-status";
import { useCreateJob } from "@/hooks/use-jobs";
import type { VideoJob } from "@/types/listing-types";
import type { JsonValue, Listing, User } from "@/types/prisma-types";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ListingSkeleton from "./components/ListingSkeleton";
import { VideoJobCard } from "./components/VideoJobCard";

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

interface PhotoWithPath {
  id: string;
  filePath: string | null;
}

const getValidVideoJobs = (videoJobs: VideoJob[]): VideoJob[] => {
  const sortedJobs = [...videoJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // For simplicity, just return the sorted jobs
  // You can add more validation logic here if needed
  return sortedJobs;
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

  const handleRegenerateImages = async (
    photoIds: string | string[]
  ): Promise<void> => {
    const idsArray = Array.isArray(photoIds) ? photoIds : [photoIds];
    try {
      if (!listing || !photoStatus?.photos) {
        toast.error("No photos available");
        return;
      }

      // Debug log
      console.log("[REGENERATE_DEBUG] Preparing request", {
        photoIds: idsArray,
        photosCount: listing.photos?.length || 0,
      });

      const response = await fetch(`/api/photos/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: idsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[REGENERATE_ERROR]", data);
        toast.error(
          data.error || `Failed to regenerate images: ${response.status}`
        );
        return;
      }

      // Check for success flag in response
      if (data.success) {
        toast.success(
          `Image regeneration started for ${idsArray.length} ${
            idsArray.length === 1 ? "photo" : "photos"
          }`
        );

        // Invalidate queries for all affected listings
        if (data.jobs?.length > 0) {
          data.jobs.forEach((job: { listingId: string }) => {
            queryClient.invalidateQueries({
              queryKey: ["listing", job.listingId],
            });
          });
        }
      } else {
        // If success is false but response was ok, show the error message
        toast.error(data.error || "Failed to regenerate images");
      }
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      toast.error("Failed to regenerate images");
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
          onRegenerateImage={handleRegenerateImages}
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
