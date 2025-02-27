"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useJobs, useRegenerateJob } from "@/hooks/use-jobs";
import { VideoJob } from "@/types/user-types";
import { JobStatus } from "@/types/job-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface JobListProps {
  listingId?: string;
  status?: JobStatus;
}

export const JobList = ({ listingId, status }: JobListProps) => {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const { data: rawJobsData, isLoading } = useJobs({ listingId, status });

  useEffect(() => {
    if (rawJobsData?.data) {
      setJobs(rawJobsData.data as VideoJob[]);
    }
  }, [rawJobsData]);

  const regenerateJob = useRegenerateJob(jobs[0]?.id || "");

  const handleRegenerate = async (jobId: string) => {
    try {
      await regenerateJob.mutateAsync({});
      toast.success("Video regeneration started");
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      toast.error("Failed to regenerate video");
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className='text-center p-4'>
        <p className='text-muted-foreground'>No jobs found</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {jobs.map((job) => (
        <Card key={job.id} className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium'>Job ID: {job.id}</p>
              <p className='text-sm text-muted-foreground'>
                Created {formatDistanceToNow(new Date(job.createdAt))} ago
              </p>
              <p className='text-sm text-muted-foreground'>
                Status:{" "}
                <span
                  className={cn(
                    "font-medium",
                    job.status === "COMPLETED" && "text-green-500",
                    job.status === "FAILED" && "text-red-500",
                    job.status === "PROCESSING" && "text-yellow-500",
                    job.status === "QUEUED" && "text-blue-500"
                  )}
                >
                  {job.status}
                </span>
              </p>
              {job.error && (
                <p className='text-sm text-red-500 mt-2'>Error: {job.error}</p>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleRegenerate(job.id)}
              disabled={regenerateJob.isPending}
            >
              {regenerateJob.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Regenerating...
                </>
              ) : (
                "Regenerate"
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
