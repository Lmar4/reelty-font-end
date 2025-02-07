"use client";

import { useToast } from "@/components/common/Toast";
import AdditionalPhotosModal from "@/components/modals/AdditionalPhotosModal";
import PricingModal from "@/components/modals/PricingModal";
import RegenerateModal from "@/components/modals/RegenerateModal";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import { useUserData } from "@/hooks/useUserData";
import { trpc } from "@/lib/trpc";
import type { PropertyOutput, RouterOutput } from "@/types/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";



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

  const { data: userData } = useUserData();
  const { data: listing } = trpc.property.getById.useQuery(
    { id: listingId },
    { enabled: !!listingId }
  );

  const { data: videoJobs } = trpc.jobs.getListingJobs.useQuery(
    { listingId },
    { enabled: !!listingId }
  );

  const [downloadJobId, setDownloadJobId] = useState<string>("");
  const { data: downloadUrl, refetch: refetchDownloadUrl } =
    trpc.jobs.getVideoDownloadUrl.useQuery(
      { jobId: downloadJobId },
      { enabled: false }
    );

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

  const property = listing || {} as PropertyOutput;
  const jobs = videoJobs || [];

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c]'>
            {property?.address || "Loading..."}
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
          {jobs.map((job: any) => (
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
          isOpen={isRegenerateModalOpen}
          onClose={() => setIsRegenerateModalOpen(false)}
          property={property}
          job={jobs[0]}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["jobs", "getListingJobs", { listingId }],
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
              queryKey: ["userData"],
            });
          }}
        />

        {/* Additional Photos Modal */}
        <AdditionalPhotosModal
          isOpen={isAdditionalPhotosModalOpen}
          onClose={() => setIsAdditionalPhotosModalOpen(false)}
          property={property}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["jobs", "getListingJobs", { listingId }],
            });
          }}
        />
      </div>
    </DashboardLayout>
  );
}
