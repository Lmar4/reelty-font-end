"use client";

import { useToast } from "@/components/common/Toast";
import { AdditionalPhotosModal } from "@/components/modals/AdditionalPhotosModal";
import PricingModal from "@/components/modals/PricingModal";
import { RegenerateModal } from "@/components/modals/RegenerateModal";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import { useUser } from "@/hooks/queries/use-user";
import { useListing } from "@/hooks/queries/use-listings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VideoJob, User } from "@/types/prisma-types";
import { useParams, useRouter } from "next/navigation";
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

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;
  const { showToast } = useToast();
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAdditionalPhotosModalOpen, setIsAdditionalPhotosModalOpen] =
    useState(false);
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { data: userData } = useUser(currentUser?.id || "");

  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
    }
  }, [userData]);

  const { data: listing } = useListing(listingId);
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

  const isPaidUser = userData?.subscriptionTier !== "free";

  // Check for post-upgrade redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade_success") === "true") {
      setIsAdditionalPhotosModalOpen(true);
      // Clean up the URL
      router.replace(`/dashboard/${listingId}`);
    }
  }, [listingId, router]);

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

  if (!property) {
    return (
      <DashboardLayout>
        <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/2 mb-8' />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='rounded-lg overflow-hidden'>
                  <div className='w-full aspect-video bg-gray-200' />
                  <div className='p-4 bg-white'>
                    <div className='h-6 bg-gray-200 rounded w-1/3 mb-4' />
                    <div className='h-4 bg-gray-200 rounded w-1/4' />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              <video
                src={job.outputFile || undefined}
                className='w-full aspect-video object-cover'
                controls
                poster={job.listing?.photos?.[0]?.filePath}
              />
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
                        className='text-sm text-blue-600 hover:text-blue-700'
                      >
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
          }}
        />
      </div>
    </DashboardLayout>
  );
}
