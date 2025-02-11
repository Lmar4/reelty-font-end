"use client";

import { useToast } from "@/components/common/Toast";
import { AdditionalPhotosModal } from "@/components/modals/AdditionalPhotosModal";
import PricingModal from "@/components/modals/PricingModal";
import { RegenerateModal } from "@/components/modals/RegenerateModal";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useListing } from "@/hooks/queries/use-listings";
import { useUser } from "@/hooks/queries/use-user";
import { Listing, VideoJob, Photo } from "@/types/prisma-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Video, Image as ImageIcon, Film, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { VideoJobCard } from "./components/VideoJobCard";
import FileUpload from "@/components/reelty/FileUpload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhotoGrid } from "./components/PhotoGrid";
import { getBaseS3Url } from "@/utils/s3-url";
import { useRegenerateJob } from "@/hooks/use-jobs";

const getPhotoUrl = (photo: Photo) => {
  if (photo.processedFilePath) {
    return getBaseS3Url(photo.processedFilePath);
  }
  return getBaseS3Url(photo.filePath);
};

async function fetchListingJobs(listingId: string): Promise<VideoJob[]> {
  const response = await fetch(`/api/jobs?listingId=${listingId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch listing jobs");
  }
  return response.json();
}

async function fetchVideoDownloadUrl(jobId: string): Promise<string> {
  const response = await fetch(`/api/jobs/${jobId}/download`);
  if (!response.ok) {
    throw new Error("Failed to get video download URL");
  }
  const data = await response.json();
  return data.url;
}

interface ListingClientProps {
  listingId: string;
  searchParams: { [key: string]: string | string[] | undefined };
  initialListing: Listing;
  initialJobs: VideoJob[];
}

interface VideoProcessingStatusProps {
  status: string;
  progress?: number;
  error?: string | null;
}

function VideoProcessingStatus({
  status,
  progress,
  error,
}: VideoProcessingStatusProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };

  const color =
    statusColors[status as keyof typeof statusColors] || statusColors.pending;

  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='font-medium capitalize'>{status}</p>
          {error && <p className='text-sm mt-1'>{error}</p>}
        </div>
        {progress !== undefined && (
          <div className='w-24 bg-white rounded-full h-2.5'>
            <div
              className='bg-blue-600 h-2.5 rounded-full'
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
  initialJobs,
}: ListingClientProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAdditionalPhotosModalOpen, setIsAdditionalPhotosModalOpen] =
    useState(false);
  const [downloadJobId, setDownloadJobId] = useState<string>("");
  const [activeJob] = initialJobs;
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  // Queries
  const { data: currentUser } = useUser("");
  const { data: userData } = useUser(currentUser?.id || "");
  const { data: listing, isLoading } = useListing(listingId, {
    initialData: initialListing,
  });
  const { data: videoJobs } = useQuery({
    queryKey: ["listingJobs", listingId],
    queryFn: () => fetchListingJobs(listingId),
    enabled: !!listingId,
    initialData: initialJobs,
  });
  const { refetch: refetchDownloadUrl } = useQuery({
    queryKey: ["videoDownload", downloadJobId],
    queryFn: () => fetchVideoDownloadUrl(downloadJobId),
    enabled: false,
  });

  // Add regenerate mutation
  const regenerateJob = useRegenerateJob(activeJob?.id || "");

  const isPaidUser = userData?.currentTierId !== "free";

  // Effects
  useEffect(() => {
    const upgradeSuccess = searchParams["upgrade_success"];
    if (upgradeSuccess === "true") {
      setIsAdditionalPhotosModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeJob && activeJob.status === "processing") {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/jobs/${activeJob.id}`);
          const updatedJob = await response.json();

          if (updatedJob.progress) {
            setProcessingProgress(updatedJob.progress);
          }

          if (updatedJob.status !== "processing") {
            clearInterval(pollInterval);
            queryClient.invalidateQueries({
              queryKey: ["listingJobs", listingId],
            });
          }
        } catch (error) {
          console.error("Failed to fetch job status:", error);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }
  }, [activeJob, listingId, queryClient]);

  // Handlers
  const handleDownload = async (jobId: string) => {
    if (!isPaidUser) {
      setIsPricingModalOpen(true);
      return;
    }

    try {
      setDownloadJobId(jobId);
      const { data: downloadUrl } = await refetchDownloadUrl();
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }
    } catch (_error) {
      showToast("Failed to download video", "error");
    }
  };

  const handleRegenerate = async () => {
    if (!activeJob) return;

    setIsRegenerating(true);
    try {
      await regenerateJob.mutateAsync({ isRegeneration: true });
      showToast("Video regeneration started", "success");

      // Invalidate queries to refresh the jobs list
      queryClient.invalidateQueries({ queryKey: ["listingJobs", listingId] });
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      showToast("Failed to regenerate video", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUpgradeClick = () => setIsPricingModalOpen(true);
  const handleFilesSelected = async (_files: File[]) => {
    // Refresh listing data to get new photos
    queryClient.invalidateQueries({
      queryKey: ["listing", listingId],
    });
  };

  if (isLoading || !initialListing || !initialListing.photos) {
    return (
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <LoadingState text='Loading property details...' size='lg' />
      </div>
    );
  }

  const photos = (listing && listing.photos) || [];
  const jobs = videoJobs || [];
  console.log("jobs", jobs);
  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {initialListing.address}
        </h1>
        <p className='text-gray-500 mt-2'>
          Manage your listing's media and video
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column - Photos */}
        <div className='lg:col-span-1 space-y-6'>
          <PhotoGrid photos={photos} photoLimit={initialListing.photoLimit} />

          {/* File Upload Section */}
          <FileUpload
            onFilesSelected={handleFilesSelected}
            maxFiles={initialListing.photoLimit - photos.length}
            accept='image/*'
          />
        </div>

        {/* Right Column - Video */}
        <div className='lg:col-span-2 space-y-6'>
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <Film className='w-5 h-5' />
                <h2 className='text-xl font-semibold'>Property Video</h2>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRegenerate}
                disabled={isRegenerating || !activeJob}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRegenerating ? "animate-spin" : ""
                  }`}
                />
                Regenerate Video
              </Button>
            </div>

            {activeJob ? (
              <div className='space-y-4'>
                <div className='relative aspect-video rounded-lg overflow-hidden bg-gray-100'>
                  {activeJob.outputFile ? (
                    <video
                      src={activeJob.outputFile}
                      controls
                      className='w-full h-full'
                      poster={photos[0] ? getPhotoUrl(photos[0]) : undefined}
                    />
                  ) : (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-center'>
                        <Film className='w-12 h-12 mx-auto text-gray-400 mb-2' />
                        <p className='text-gray-500'>
                          Video is being processed...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <VideoProcessingStatus
                  status={activeJob.status}
                  progress={processingProgress}
                  error={activeJob.error}
                />
              </div>
            ) : (
              <div className='text-center py-12'>
                <Film className='w-12 h-12 mx-auto text-gray-400 mb-2' />
                <h3 className='text-lg font-medium text-gray-900'>
                  No video generated yet
                </h3>
                <p className='text-gray-500 mt-1'>
                  Upload photos to generate a video
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
