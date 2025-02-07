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
import { User, VideoJob } from "@/types/prisma-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Video } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

async function fetchListingJobs(listingId: string): Promise<VideoJob[]> {
  const response = await fetch(`/api/jobs?listingId=${listingId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch listing jobs');
  }
  return response.json();
}

async function fetchVideoDownloadUrl(jobId: string): Promise<string> {
  const response = await fetch(`/api/jobs/${jobId}/download`);
  if (!response.ok) {
    throw new Error('Failed to get video download URL');
  }
  const data = await response.json();
  return data.url;
}

interface ListingPageProps {
  params: {
    listingId: string;
  };
}

export default function ListingPage({ params }: ListingPageProps) {

  const listingId = params.listingId as string;
  const { showToast } = useToast();
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAdditionalPhotosModalOpen, setIsAdditionalPhotosModalOpen] =
    useState(false);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { data: userData } = useUser(currentUser?.id || "");

  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
    }
  }, [userData]);

  const { data: listing, isLoading } = useListing(listingId);
  const { data: videoJobs } = useQuery({
    queryKey: ['listingJobs', listingId],
    queryFn: () => fetchListingJobs(listingId),
    enabled: !!listingId,
  });

  const [downloadJobId, setDownloadJobId] = useState<string>("");
  const { data: downloadUrl, refetch: refetchDownloadUrl } = useQuery({
    queryKey: ['videoDownload', downloadJobId],
    queryFn: () => fetchVideoDownloadUrl(downloadJobId),
    enabled: false,
  });

  const isPaidUser = userData?.currentTierId !== "free";

  // Check for upgrade success and show modal
  useEffect(() => {
    const upgradeSuccess = searchParams.get("upgrade_success");
    if (upgradeSuccess === "true") {
      setIsAdditionalPhotosModalOpen(true);
    }
  }, [searchParams]);

  const handleDownload = async (jobId: string) => {
    if (!isPaidUser) {
      setIsPricingModalOpen(true);
      return;
    }

    try {
      setDownloadJobId(jobId);
      const result = await refetchDownloadUrl();
      if (result.data) {
        window.open(result.data, "_blank");
      }
    } catch (error) {
      showToast("Failed to download video", "error");
    }
  };

  const handleUpgradeClick = () => {
    setIsPricingModalOpen(true);
  };

  const property = listing || null;
  const jobs = videoJobs || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
          <LoadingState 
            text="Loading property details..."
            size="lg"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
          <LoadingState 
            text="Loading property details..."
            size="lg"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c]'>
            {property.address}
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

        {jobs.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No videos generated yet"
            description="Your videos are being processed. This might take a few minutes."
            action={jobs.some(job => job.status === "failed") ? {
              label: "Regenerate Videos",
              onClick: () => setIsRegenerateModalOpen(true)
            } : undefined}
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`relative rounded-lg overflow-hidden ${
                  !isPaidUser && job.template !== "basic"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {job.status === "processing" ? (
                  <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                    <LoadingState 
                      text="Processing video..."
                      size="sm"
                      className="min-h-0"
                    />
                  </div>
                ) : (
                  <video
                    src={job.outputFile || undefined}
                    className='w-full aspect-video object-cover'
                    controls
                    poster={job.listing?.photos?.[0]?.filePath}
                  />
                )}
                <div className='p-4 bg-white'>
                  <h3 className='text-lg font-semibold mb-2'>
                    {job.template 
                      ? job.template.charAt(0).toUpperCase() + job.template.slice(1)
                      : 'Basic'
                    }
                  </h3>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-500'>
                        {job.status === "completed"
                          ? "Ready"
                          : job.status === "failed"
                            ? "Failed"
                            : "Processing..."}
                      </span>
                      {job.status === "failed" && (
                        <button
                          onClick={() => setIsRegenerateModalOpen(true)}
                          className='text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1'
                        >
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </button>
                      )}
                    </div>
                    {job.status === "completed" && (
                      <button
                        onClick={() => handleDownload(job.id)}
                        disabled={!isPaidUser && job.template !== "basic"}
                        className={`px-4 py-2 rounded-lg ${
                          !isPaidUser && job.template !== "basic"
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        Download
                      </button>
                    )}
                  </div>
                  {!isPaidUser && job.template !== "basic" && (
                    <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                      <span className='text-white text-lg font-semibold'>
                        Premium Template
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Regenerate Modal */}
        <RegenerateModal
          jobId={jobs[0]?.id || ""}
          isOpen={isRegenerateModalOpen}
          onClose={() => setIsRegenerateModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['listingJobs', listingId],
            });
          }}
        />

        {/* Pricing Modal */}
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          listingId={listingId}
          onUpgradeComplete={() => {
            queryClient.invalidateQueries({
              queryKey: ['user'],
            });
          }}
        />

        {/* Additional Photos Modal */}
        <AdditionalPhotosModal
          listingId={listingId}
          isOpen={isAdditionalPhotosModalOpen}
          onClose={() => setIsAdditionalPhotosModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['listingJobs', listingId],
            });
            window.location.reload();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
