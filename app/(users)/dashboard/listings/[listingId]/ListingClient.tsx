"use client";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import { useListing } from "@/hooks/queries/use-listings";
import { usePhotoStatus } from "@/hooks/queries/use-photo-status";
import { useVideoStatus } from "@/hooks/queries/use-video-status";
import { useCreateJob } from "@/hooks/use-jobs";
import { sendVideoGeneratedEmail } from "@/lib/plunk";
import { VideoJob } from "@/types/listing-types";
import type { JsonValue, Listing, User } from "@/types/prisma-types";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ListingSkeleton from "./components/ListingSkeleton";
import { TemplateGrid } from "./components/TemplateGrid";

interface ExtendedListing extends Listing {
  currentJobId?: string;
  videoJobs?: VideoJob[];
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

interface VideoStatus {
  isProcessing: boolean;
  processingCount: number;
  failedCount: number;
  completedCount: number;
  totalCount: number;
  shouldEndPolling?: boolean;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
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
    listing: listing?.data,
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
  const [downloadCount, setDownloadCount] = useState(0);
  const queryClient = useQueryClient();
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

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

  // Group video jobs by template
  const videoJobs = useMemo(() => {
    const jobs = listing?.videoJobs || videoData?.data?.videos || [];
    if (!Array.isArray(jobs)) return [];

    return [...jobs].sort((a: VideoJob, b: VideoJob) => {
      const dateA =
        a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB =
        b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [listing?.videoJobs, videoData?.data?.videos]);

  // Get active jobs
  const activeJobs = useMemo(() => {
    if (!videoJobs?.length) return [];
    return videoJobs.filter(
      (job: VideoJob) => job.status === "PROCESSING" || job.status === "PENDING"
    );
  }, [videoJobs]);

  // Only show loading state when we don't have the initial listing data
  const isLoading = isLoadingInitial || !listing;

  // Handle video generation
  const handleVideoGeneration = async (templateId: string) => {
    if (!listing || !photoStatus?.data?.photos?.length) return;

    try {
      await createVideoJob({
        listingId,
        template: templateId,
        inputFiles: photoStatus.data.photos
          .map((photo) => photo.url)
          .filter(Boolean),
      });
    } catch (error) {
      console.error("Failed to generate video:", error);
      toast.error("Failed to generate video. Please try again.");
    }
  };

  // Handle download
  const handleDownload = async (jobId: string) => {
    const job = videoJobs.find((j) => j.id === jobId);
    if (!job) return;

    // Get the processed template path
    const processedTemplate = job.metadata?.processedTemplates?.find(
      (template: { key: string; path: string }) => template.key === job.template
    );
    const videoUrl = processedTemplate?.path || job.outputFile;

    if (videoUrl) {
      try {
        const response = await fetch(videoUrl);
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
        // Increment download count for free users
        if (userData?.currentTierId === "FREE") {
          setDownloadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Download failed:", error);
        window.open(videoUrl, "_blank");
      }
    }
  };

  // Handle regenerate images
  const handleRegenerateImages = async (photoIds: string | string[]) => {
    const idsArray = Array.isArray(photoIds) ? photoIds : [photoIds];
    try {
      if (!listing || !photoStatus?.data?.photos) {
        toast.error("No photos available");
        return;
      }

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

      if (data.success) {
        toast.success(
          `Image regeneration started for ${idsArray.length} ${
            idsArray.length === 1 ? "photo" : "photos"
          }`
        );

        if (data.jobs?.length > 0) {
          data.jobs.forEach((job: { listingId: string }) => {
            queryClient.invalidateQueries({
              queryKey: ["listing", job.listingId],
            });
          });
        }
      } else {
        toast.error(data.error || "Failed to regenerate images");
      }
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      toast.error("Failed to regenerate images");
    }
  };

  // Add the checkAndNotifyVideoCompletion function
  const checkAndNotifyVideoCompletion = async (videoJobs: VideoJob[]) => {
    // If we've already sent a notification for this session, don't send again
    if (hasNotifiedCompletion) return;

    // Get the latest job for each template
    const latestJobsByTemplate = new Map<string, VideoJob>();

    videoJobs.forEach((job) => {
      if (!job.template) return; // Skip jobs without a template
      const existing = latestJobsByTemplate.get(job.template);
      if (!existing || new Date(job.createdAt) > new Date(existing.createdAt)) {
        latestJobsByTemplate.set(job.template, job);
      }
    });

    // Check if all templates have their latest job completed
    const allTemplatesCompleted = [
      "crescendo",
      "wave",
      "storyteller",
      "googlezoomintro",
      "wesanderson",
      "hyperpop",
    ].every((template) => {
      const latestJob = latestJobsByTemplate.get(template);
      return latestJob?.status === "COMPLETED";
    });

    if (allTemplatesCompleted && !hasNotifiedCompletion) {
      try {
        // Type guard for currentUser and listing
        if (!currentUser?.email || !listing?.address) {
          console.warn("Missing required data for email notification");
          return;
        }

        // At this point we know these values exist, but TypeScript needs help
        const userEmail: string = currentUser.email;
        const listingAddress: string = listing.address;

        await sendVideoGeneratedEmail(
          userEmail,
          "there", // Use a default value since we don't have a reliable name
          listingAddress,
          listingId
        );

        // Mark as notified to prevent duplicate emails
        setHasNotifiedCompletion(true);

        // Store in localStorage to prevent notifications on page reloads
        localStorage.setItem(`notified_${listingId}`, "true");
      } catch (error) {
        console.error("Failed to send completion notification:", error);
      }
    }
  };

  // Add useEffect for checking completion status
  useEffect(() => {
    if (videoJobs?.length > 0 && currentUser?.email && listing?.address) {
      // Check if we've already notified for this listing
      const hasNotified = localStorage.getItem(`notified_${listingId}`);
      if (!hasNotified) {
        checkAndNotifyVideoCompletion(videoJobs);
      }
    }
  }, [videoJobs, currentUser, listing]);

  // Add useEffect to reset notification state when listingId changes
  useEffect(() => {
    setHasNotifiedCompletion(false);
  }, [listingId]);

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
          <TemplateGrid
            videoJobs={videoJobs}
            photos={photoStatus?.data?.photos || []}
            isLoading={isLoading}
            userTier={userData?.currentTierId || "FREE"}
            activeJobs={activeJobs}
            onGenerateVideo={handleVideoGeneration}
            onDownload={handleDownload}
            isGenerating={isGeneratingVideo}
            downloadCount={downloadCount}
          />
        </div>

        <PropertySettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          address={initialListing.address}
          photos={photoStatus?.data?.photos || []}
          onRegenerateImage={handleRegenerateImages}
          isLoading={isLoadingPhotoStatus}
        />
      </div>
    </ErrorBoundary>
  );
}
