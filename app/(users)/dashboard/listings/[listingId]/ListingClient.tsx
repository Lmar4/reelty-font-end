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
import { Listing, VideoJob } from "@/types/prisma-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Video } from "lucide-react";
import { useEffect, useState } from "react";
import { VideoJobCard } from "./components/VideoJobCard";
import FileUpload from "@/components/reelty/FileUpload";

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
  params: {
    listingId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
  initialListing: Listing;
  initialJobs: VideoJob[];
}

export function ListingClient({
  params,
  searchParams,
  initialListing,
  initialJobs,
}: ListingClientProps) {
  const listingId = params.listingId;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAdditionalPhotosModalOpen, setIsAdditionalPhotosModalOpen] =
    useState(false);
  const [downloadJobId, setDownloadJobId] = useState<string>("");

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

  const isPaidUser = userData?.currentTierId !== "free";

  // Effects
  useEffect(() => {
    const upgradeSuccess = searchParams["upgrade_success"];
    if (upgradeSuccess === "true") {
      setIsAdditionalPhotosModalOpen(true);
    }
  }, [searchParams]);

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

  const handleRegenerate = () => setIsRegenerateModalOpen(true);
  const handleUpgradeClick = () => setIsPricingModalOpen(true);
  const handleFilesSelected = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      // Refresh listing data to get new photos
      queryClient.invalidateQueries({
        queryKey: ["listing", listingId],
      });

      showToast("Files uploaded successfully", "success");
    } catch (error) {
      console.error("[UPLOAD_ERROR]", error);
      showToast("Failed to upload files", "error");
    }
  };

  if (isLoading || !listing) {
    return (
      <DashboardLayout>
        <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
          <LoadingState text='Loading property details...' size='lg' />
        </div>
      </DashboardLayout>
    );
  }

  const jobs = videoJobs || [];

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c]'>
            {listing.address}
          </h1>
          {!isPaidUser && (
            <button
              onClick={handleUpgradeClick}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Upgrade to Pro
            </button>
          )}
        </div>

        {/* File Upload Section */}
        <div className='mb-8'>
          <FileUpload
            buttonText='Add more photos'
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            maxSize={15}
          />
        </div>

        {/* Content */}
        {jobs.length === 0 ? (
          <EmptyState
            icon={Video}
            title='No videos generated yet'
            description='Your videos are being processed. This might take a few minutes.'
            action={
              jobs.some((job) => job.status === "failed")
                ? {
                    label: "Regenerate Videos",
                    onClick: handleRegenerate,
                  }
                : undefined
            }
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {jobs.map((job) => (
              <VideoJobCard
                key={job.id}
                job={job}
                isPaidUser={isPaidUser}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <RegenerateModal
          jobId={jobs[0]?.id || ""}
          isOpen={isRegenerateModalOpen}
          onClose={() => setIsRegenerateModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["listingJobs", listingId],
            });
          }}
        />

        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          listingId={listingId}
          onUpgradeComplete={() => {
            queryClient.invalidateQueries({
              queryKey: ["user"],
            });
          }}
        />

        <AdditionalPhotosModal
          listingId={listingId}
          isOpen={isAdditionalPhotosModalOpen}
          onClose={() => setIsAdditionalPhotosModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["listingJobs", listingId],
            });
            window.location.reload();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
