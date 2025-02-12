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

const JobStatusMessage = ({ job }: { job?: VideoJob }) => {
  if (!job) return null;

  const isError = job.status === "FAILED" && job.error;

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

  if (job.status === "COMPLETED" && !isError) return null;

  const config =
    statusConfig[job.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <div className='flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-6'>
      <div className='flex items-center text-gray-700'>
        {config.icon}
        <span className='text-[15px]'>
          {config.message}
          {job.status === "PROCESSING" && job.progress && (
            <span className='ml-2 text-[13px] text-gray-500'>
              ({Math.round(job.progress)}%)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

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

const ListingBreadcrumb: React.FC<{ address: string; listingId: string }> = ({
  address,
  listingId,
}) => (
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
        {address}
      </h1>
    </div>
    <p className='text-[14px] text-[#1c1c1c]/60 mt-2'>
      Video appear glitchy? Don't worry, it won't when you download it.
    </p>
  </div>
);

const TemplateGrid: React.FC<{
  templates: VideoTemplate[];
  isLoading: boolean;
  userTier: string;
  isRegenerating: boolean;
  activeJob?: VideoJob;
  onDownload: (jobId: string, templateId: string) => void;
}> = ({
  templates,
  isLoading,
  userTier,
  isRegenerating,
  activeJob,
  onDownload,
}) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0'>
        <TemplateSkeleton />
        <TemplateSkeleton />
        <TemplateSkeleton />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0'>
      {templates.map((template) => {
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
                  onDownload(activeJob?.id || "", template.id)
                }
                className={`w-full rounded-lg py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium transition-colors ${
                  !isTemplateAvailable ||
                  isRegenerating ||
                  !activeJob?.outputFile
                    ? "bg-[#d1d1d1] text-[#1c1c1c]/40 cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/90"
                }`}
                disabled={
                  !isTemplateAvailable ||
                  isRegenerating ||
                  !activeJob?.outputFile
                }
              >
                {isRegenerating ? "Regenerating..." : "Download HD"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const useVideoDownload = () => {
  const { showToast } = useToast();
  const [downloadJobId, setDownloadJobId] = useState<string>("");

  const { refetch: refetchDownloadUrl } = useQuery({
    queryKey: ["videoDownload", downloadJobId],
    queryFn: () => fetchVideoDownloadUrl(downloadJobId),
    enabled: false,
  });

  const handleDownload = async (
    jobId: string,
    templateId: string,
    isTemplateAvailable: boolean
  ) => {
    if (!isTemplateAvailable) {
      return false;
    }

    try {
      setDownloadJobId(jobId);
      const { data: downloadUrl } = await refetchDownloadUrl();
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }
      return true;
    } catch {
      showToast("Failed to download video", "error");
      return false;
    }
  };

  return { handleDownload };
};

const useListingData = (
  listingId: string,
  initialListing: Listing,
  initialJobs: VideoJob[]
) => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useUser("me");
  const { data: userData, isLoading: isUserLoading } = useUser(
    currentUser?.id || "me"
  );
  const { data: listing, isLoading: isListingLoading } = useListing(listingId, {
    initialData: initialListing,
  });

  const { data: videoJobs = initialJobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ["listingJobs", listingId],
    queryFn: () => fetchListingJobs(listingId),
    enabled: !!listingId,
    initialData: initialJobs,
    refetchInterval: (query) => {
      const data = query.state.data;
      const latestJob = data?.[0];
      return latestJob?.status === "PROCESSING" ||
        latestJob?.status === "QUEUED"
        ? 5000
        : false;
    },
    retry: 3,
  });

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

  return {
    currentUser,
    userData,
    listing,
    videoJobs,
    templates,
    isLoading:
      isCurrentUserLoading ||
      isUserLoading ||
      isListingLoading ||
      isJobsLoading ||
      isTemplatesLoading,
  };
};

export function ListingClient({
  listingId,
  searchParams,
  initialListing,
  initialJobs,
}: ListingClientProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Custom hooks
  const { handleDownload } = useVideoDownload();
  const { currentUser, userData, listing, videoJobs, templates, isLoading } =
    useListingData(listingId, initialListing, initialJobs);

  // Derived state
  const activeJob = videoJobs[0];
  const isRegenerating =
    activeJob?.status === "PROCESSING" || activeJob?.status === "QUEUED";
  const userTier = userData?.currentTier?.name?.toLowerCase() || "free";
  const photos = (listing && listing.photos) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <LoadingState text='Loading data...' size='lg' />
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

  if (!initialListing || !initialListing.photos) {
    return (
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <LoadingState text='Loading property details...' size='lg' />
      </div>
    );
  }

  const handleTemplateDownload = async (jobId: string, templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    const isTemplateAvailable = template?.subscriptionTiers?.some(
      (tier) => tier.name.toLowerCase() === userTier
    );

    if (!isTemplateAvailable) {
      setIsPricingModalOpen(true);
      return;
    }

    await handleDownload(jobId, templateId, isTemplateAvailable);
  };

  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
      <ListingBreadcrumb
        address={initialListing.address}
        listingId={listingId}
      />
      <JobStatusMessage job={activeJob} />

      <div className='-mx-2 md:mx-0'>
        <TemplateGrid
          templates={templates}
          isLoading={isLoading}
          userTier={userTier}
          isRegenerating={isRegenerating}
          activeJob={activeJob}
          onDownload={handleTemplateDownload}
        />
      </div>

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
          queryClient.invalidateQueries({ queryKey: ["user"] });
          queryClient.invalidateQueries({ queryKey: ["templates"] });
        }}
      />
    </div>
  );
}
