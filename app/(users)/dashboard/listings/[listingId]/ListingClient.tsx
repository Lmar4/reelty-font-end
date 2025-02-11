"use client";

import { useToast } from "@/components/common/Toast";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import PricingModal from "@/components/modals/PricingModal";
import { LoadingState } from "@/components/ui/loading-state";
import { useListing } from "@/hooks/queries/use-listings";
import { useTemplates } from "@/hooks/queries/use-templates";
import { useUser } from "@/hooks/queries/use-user";
import { useRegenerateJob } from "@/hooks/use-jobs";
import { Listing, Photo, VideoJob } from "@/types/prisma-types";
import { getBaseS3Url } from "@/utils/s3-url";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  subscriptionTiers: Array<{ name: string }>;
}

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

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
  initialJobs,
}: ListingClientProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [downloadJobId, setDownloadJobId] = useState<string>("");
  const [activeJob] = initialJobs;
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Queries
  const { data: currentUser, isLoading: isCurrentUserLoading } = useUser("me");
  const { data: userData, isLoading: isUserLoading } = useUser(
    currentUser?.id || "me"
  );
  const { data: listing, isLoading: isListingLoading } = useListing(listingId, {
    initialData: initialListing,
  });

  const { data: videoJobs } = useQuery({
    queryKey: ["listingJobs", listingId],
    queryFn: () => fetchListingJobs(listingId),
    enabled: !!listingId,
    initialData: initialJobs,
  });

  // Add templates query
  const { data: templates = [] } = useQuery<VideoTemplate[]>({
    queryKey: ["videoTemplates"],
    queryFn: async () => {
      const response = await fetch(`/api/video-templates`);
      if (!response.ok) {
        throw new Error("Failed to fetch video templates");
      }
      return response.json();
    },
  });

  const { refetch: refetchDownloadUrl } = useQuery({
    queryKey: ["videoDownload", downloadJobId],
    queryFn: () => fetchVideoDownloadUrl(downloadJobId),
    enabled: false,
  });

  // Effects
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
  const handleDownload = async (jobId: string, templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    const userTier = userData?.currentTier?.name?.toLowerCase() || "free";
    const isTemplateAvailable = template?.subscriptionTiers?.some(
      (tier) => tier.name.toLowerCase() === userTier
    );

    if (!isTemplateAvailable) {
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

  if (
    isListingLoading ||
    isUserLoading ||
    !initialListing ||
    !initialListing.photos
  ) {
    return (
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <LoadingState text='Loading property details...' size='lg' />
      </div>
    );
  }

  const photos = (listing && listing.photos) || [];

  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
      {/* Breadcrumb Navigation */}
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
            {initialListing.address}
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

      {/* Templates Grid */}
      <div className='-mx-2 md:mx-0'>
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0'>
          {templates.map((template) => {
            const userTier =
              userData?.currentTier?.name?.toLowerCase() || "free";
            const isTemplateAvailable = template.subscriptionTiers?.some(
              (tier) => tier.name.toLowerCase() === userTier
            );

            return (
              <div
                key={template.id}
                className='bg-white rounded-lg overflow-hidden shadow-sm'
              >
                <div className='relative aspect-[9/16] overflow-hidden'>
                  <Image
                    src={
                      template.thumbnailUrl ||
                      `/images/templates/${template.id}.jpg`
                    }
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
                  {!isTemplateAvailable && (
                    <div className='absolute inset-0 bg-black/50' />
                  )}
                </div>
                <div className='p-3 md:p-4 bg-[#ebebeb]'>
                  <div className='flex items-center justify-between mb-3 md:mb-4'>
                    <h3 className='text-[13px] md:text-[15px] font-bold text-[#1c1c1c]'>
                      {template.name}
                    </h3>
                    {!isTemplateAvailable && (
                      <span className='text-[11px] md:text-[13px] font-medium bg-black text-white px-2 py-0.5 rounded'>
                        Pro
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      isTemplateAvailable &&
                      handleDownload(activeJob?.id || "", template.id)
                    }
                    className={`w-full rounded-lg py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium transition-colors ${
                      !isTemplateAvailable
                        ? "bg-[#d1d1d1] text-[#1c1c1c]/40 cursor-not-allowed"
                        : "bg-black text-white hover:bg-black/90"
                    }`}
                    disabled={!isTemplateAvailable || !activeJob?.outputFile}
                  >
                    Download HD
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <PropertySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        jobId={activeJob?.id || ""}
        address={initialListing.address}
        photos={photos.map((photo) => ({
          id: photo.id,
          url: getPhotoUrl(photo),
          hasError: photo.status === "error",
        }))}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        listingId={listingId}
        onUpgradeComplete={() => {
          setIsPricingModalOpen(false);
          // Refresh data after upgrade
          queryClient.invalidateQueries({ queryKey: ["user"] });
          queryClient.invalidateQueries({ queryKey: ["templates"] });
        }}
      />
    </div>
  );
}
