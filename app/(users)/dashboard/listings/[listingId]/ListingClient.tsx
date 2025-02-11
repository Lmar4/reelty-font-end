"use client";

import { useToast } from "@/components/common/Toast";
import PricingModal from "@/components/modals/PricingModal";
import { PropertySettingsModal } from "@/components/modals/PropertySettingsModal";
import { LoadingState } from "@/components/ui/loading-state";
import { useListing } from "@/hooks/queries/use-listings";
import { useUser } from "@/hooks/queries/use-user";
import { Listing, Photo, VideoJob } from "@/types/prisma-types";
import { getBaseS3Url } from "@/utils/s3-url";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  initialListing: Listing;
  initialJobs: VideoJob[];
  searchParams: { [key: string]: string | string[] | undefined };
}

// Add JobStatusMessage component
const JobStatusMessage = ({ job }: { job?: VideoJob }) => {
  if (!job) return null;

  // Only show error state if the job is actually in error state and has an error message
  const isError = job.status === "error" && job.error;

  const statusConfig = {
    pending: {
      message: "Your video is queued for generation...",
      icon: (
        <svg
          className='animate-spin -ml-1 mr-3 h-5 w-5'
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
      ),
    },
    processing: {
      message: "Generating your video...",
      icon: (
        <svg
          className='animate-spin -ml-1 mr-3 h-5 w-5'
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
      ),
    },
    completed: {
      message: "Your video is ready to download!",
      icon: (
        <svg
          className='-ml-1 mr-3 h-5 w-5 text-green-500'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 13l4 4L19 7'
          />
        </svg>
      ),
    },
    error: {
      message:
        job.error ||
        "There was an error generating your video. Please try again.",
      icon: (
        <svg
          className='-ml-1 mr-3 h-5 w-5 text-red-500'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      ),
    },
  };

  // Only show message if job is not completed or if there's an error
  if (job.status === "completed" && !isError) return null;

  const config =
    statusConfig[job.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <div className='flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-6'>
      <div className='flex items-center text-gray-700'>
        {config.icon}
        <span className='text-[15px]'>
          {config.message}
          {job.status === "processing" && job.progress && (
            <span className='ml-2 text-[13px] text-gray-500'>
              ({Math.round(job.progress)}%)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

// Add TemplateSkeleton component
const TemplateSkeleton = () => (
  <div className='bg-white rounded-lg overflow-hidden shadow-sm animate-pulse'>
    <div className='relative aspect-[9/16] bg-gray-200' />
    <div className='p-3 md:p-4 bg-[#ebebeb]'>
      <div className='flex items-center justify-between mb-3 md:mb-4'>
        <div className='h-4 bg-gray-200 rounded w-24' />
      </div>
      <div className='h-8 bg-gray-200 rounded' />
    </div>
  </div>
);

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
  initialJobs,
}: ListingClientProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  // State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [downloadJobId, setDownloadJobId] = useState<string>("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // All queries
  const { data: currentUser, isLoading: isCurrentUserLoading } = useUser("me");

  const { data: userData, isLoading: isUserLoading } = useUser(
    currentUser?.id || "me"
  );

  const { data: listing, isLoading: isListingLoading } = useListing(listingId, {
    initialData: initialListing,
  });

  // Update job polling query with error handling
  const { data: videoJobs = initialJobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ["listingJobs", listingId],
    queryFn: () => fetchListingJobs(listingId),
    enabled: !!listingId,
    initialData: initialJobs,
    refetchInterval: (query) => {
      const data = query.state.data;
      const latestJob = data?.[0];
      return latestJob?.status === "processing" ||
        latestJob?.status === "pending"
        ? 5000
        : false;
    },
    retry: 3,
  });

  // Get the latest active job and check if regenerating
  const activeJob = videoJobs[0];
  const isRegenerating =
    activeJob?.status === "processing" || activeJob?.status === "pending";

  const { data: templates = [], isLoading: isTemplatesLoading } = useQuery<
    VideoTemplate[]
  >({
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

  // Loading state
  if (isCurrentUserLoading || isUserLoading) {
    return (
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <LoadingState text='Loading user data...' size='lg' />
      </div>
    );
  }

  // Error state
  if (!currentUser || !userData) {
    return (
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>Failed to load user data</p>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["user"] });
              router.push(`/login?returnTo=/dashboard/listings/${listingId}`);
            }}
            className='bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle download
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
    } catch {
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

  // Update templates grid to show loading state during regeneration
  const renderTemplateCard = (template: VideoTemplate) => {
    const userTier = userData?.currentTier?.name?.toLowerCase() || "free";
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
              template.thumbnailUrl || `/images/templates/${template.id}.jpg`
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
          {(!isTemplateAvailable || isRegenerating) && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              {isRegenerating && (
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
              )}
            </div>
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
              !isTemplateAvailable || isRegenerating || !activeJob?.outputFile
                ? "bg-[#d1d1d1] text-[#1c1c1c]/40 cursor-not-allowed"
                : "bg-black text-white hover:bg-black/90"
            }`}
            disabled={
              !isTemplateAvailable || isRegenerating || !activeJob?.outputFile
            }
          >
            {isRegenerating ? "Regenerating..." : "Download HD"}
          </button>
        </div>
      </div>
    );
  };

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

      {/* Job Status Message */}
      <JobStatusMessage job={activeJob} />

      {/* Templates Grid */}
      <div className='-mx-2 md:mx-0'>
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0'>
          {isTemplatesLoading ? (
            <>
              <TemplateSkeleton />
              <TemplateSkeleton />
              <TemplateSkeleton />
            </>
          ) : (
            templates.map(renderTemplateCard)
          )}
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
