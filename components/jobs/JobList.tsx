"use client";

import { useToast } from "@/components/common/Toast";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface JobListProps {
  userId: string;
}

export default function JobList({ userId }: JobListProps) {
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  const { data: jobsData } = trpc.jobs.getUserJobs.useQuery({
    userId,
    limit: ITEMS_PER_PAGE,
    cursor: null, // We'll implement pagination later
  });

  const regenerateVideo = trpc.jobs.regenerateVideos.useMutation({
    onSuccess: () => {
      showToast("Job cancelled and new video generation started", "success");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const handleCancel = async (
    jobId: string,
    listingId: string,
    template: string
  ) => {
    try {
      setSelectedJob(jobId);
      await regenerateVideo.mutateAsync({
        listingId,
        photoIds: [], // This will effectively cancel the job by creating a new one with no photos
        template,
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to cancel job",
        "error"
      );
    } finally {
      setSelectedJob(null);
    }
  };

  return (
    <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <div className='text-center'>
        <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
          Job List
        </h2>
      </div>

      <div className='mt-12'>
        {!jobsData?.items || jobsData.items.length === 0 ? (
          <p className='text-center text-gray-600'>No jobs found</p>
        ) : (
          <div className='space-y-4'>
            {jobsData.items.map((job) => (
              <div key={job.id} className='bg-white shadow rounded-lg p-6'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Video Generation - {job.template}
                    </h3>
                    <p className='mt-2 text-sm text-gray-500'>
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <p className='mt-1 text-sm text-gray-500'>
                      Updated: {new Date(job.updatedAt).toLocaleDateString()}
                    </p>
                    <p
                      className={`mt-2 text-sm ${
                        job.status === "completed"
                          ? "text-green-600"
                          : job.status === "failed"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      Status: {job.status}
                    </p>
                  </div>
                  {job.status === "pending" && (
                    <button
                      onClick={() =>
                        handleCancel(
                          job.id,
                          job.listingId,
                          job.template || "basic"
                        )
                      }
                      disabled={selectedJob === job.id}
                      className='text-red-600 hover:text-red-700'
                      aria-label='Cancel job'
                    >
                      {selectedJob === job.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
