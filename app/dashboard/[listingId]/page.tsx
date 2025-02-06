"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import { useUserData } from "@/hooks/useUserData";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/common/Toast";
import RegenerateModal from "@/components/modals/RegenerateModal";

export default function ListingDetail() {
  const params = useParams();
  const listingId = params.listingId as string;
  const { showToast } = useToast();
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: userData } = useUserData();
  const { data: listing } = trpc.listings.getById.useQuery(
    { id: listingId },
    { enabled: !!listingId }
  );

  const { data: videoJobs } = trpc.listings.getVideoJobs.useQuery(
    { listingId },
    { enabled: !!listingId }
  );

  const [downloadJobId, setDownloadJobId] = useState<string>("");
  const { data: downloadUrl, refetch: refetchDownloadUrl } =
    trpc.listings.getVideoDownloadUrl.useQuery(
      { jobId: downloadJobId },
      { enabled: false }
    );

  const isPaidUser = userData?.subscriptionTier !== "free";

  const handleDownload = async (jobId: string) => {
    if (!isPaidUser) {
      showToast("Upgrade your subscription to download this video", "warning");
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

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-8'>
          {listing?.address || "Loading..."}
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {videoJobs?.map((job) => (
            <div
              key={job.id}
              className={`relative rounded-lg overflow-hidden ${
                !isPaidUser && job.template !== "basic"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <video
                src={job.previewUrl || undefined}
                className='w-full aspect-video object-cover'
                controls
                poster={listing?.thumbnailUrl || undefined}
              />
              <div className='p-4 bg-white'>
                <h3 className='text-lg font-semibold mb-2'>
                  {job.template.charAt(0).toUpperCase() + job.template.slice(1)}
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
          listingId={listingId}
          template='crescendo'
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["videoJobs", listingId],
            });
          }}
        />
      </div>
    </DashboardLayout>
  );
}
