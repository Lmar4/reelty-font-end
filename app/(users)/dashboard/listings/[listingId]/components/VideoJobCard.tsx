"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VideoJob } from "@/types/listing-types";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useVideoStatus } from "@/hooks/queries/use-video-status";

interface VideoJobCardProps {
  job: VideoJob;
  isPaidUser: boolean;
  onDownload: (jobId: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  listingId: string;
}

export const VideoJobCard: React.FC<VideoJobCardProps> = ({
  job,
  isPaidUser,
  onDownload,
  onRegenerate,
  isRegenerating = false,
  listingId,
}) => {
  const { data: videoStatus, error, isError } = useVideoStatus(listingId);

  // Handle max retries reached
  const isMaxRetriesReached = error?.message?.includes("Max retries reached");

  // Handle rate limiting
  const isRateLimited = error?.message?.includes("Rate limited");

  if (isError && !isRateLimited && !isMaxRetriesReached) {
    return (
      <div className='p-4 rounded-lg bg-red-50 text-red-700'>
        Error loading video status. Please try refreshing the page.
      </div>
    );
  }

  if (isRateLimited) {
    return (
      <div className='p-4 rounded-lg bg-yellow-50 text-yellow-700'>
        Too many requests. Please wait a moment...
      </div>
    );
  }

  if (isMaxRetriesReached) {
    return (
      <div className='p-4 rounded-lg bg-yellow-50 text-yellow-700'>
        Taking longer than expected. Please refresh the page to check status.
      </div>
    );
  }

  const isBasicTemplate = job.template === "basic";
  const isPremiumLocked = !isPaidUser && !isBasicTemplate;

  return (
    <div className='relative'>
      {isRegenerating && (
        <div className='absolute inset-0 bg-white/50 z-10 flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
        </div>
      )}
      <Card className='overflow-hidden group'>
        <div className='relative aspect-[9/16] bg-gray-100'>
          {job.status === "PROCESSING" ? (
            <div className='absolute inset-0 flex items-center justify-center'>
              <LoadingState
                text='Processing video...'
                size='sm'
                className='min-h-0'
              />
            </div>
          ) : (
            <>
              {/* Show thumbnail when available */}
              {job.thumbnailUrl && (
                <Image
                  src={job.thumbnailUrl}
                  alt={`${job.template || "Video"} thumbnail`}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 50vw, 25vw'
                />
              )}
              {/* Video element with poster */}
              <video
                src={job.outputFile || undefined}
                className='absolute inset-0 w-full h-full object-cover'
                controls
                poster={job.thumbnailUrl || job.inputFiles?.[0]}
              />
            </>
          )}
          {isPremiumLocked && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <span className='text-white text-sm font-medium px-3 py-1 bg-black/70 rounded-full'>
                Pro
              </span>
            </div>
          )}
        </div>
        <div className='p-4'>
          <h3 className='text-base font-medium'>
            {job.template
              ? job.template.charAt(0).toUpperCase() + job.template.slice(1)
              : "Basic"}
          </h3>

          {job.status === "PROCESSING" ? (
            <div className='mt-4 space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Processing...</span>
                <span className='text-muted-foreground'>{job.progress}%</span>
              </div>
              <div className='w-full bg-gray-100 rounded-full h-1.5'>
                <div
                  className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              className='w-full mt-4 bg-black text-white '
              variant={job.status === "COMPLETED" ? "outline" : "default"}
              disabled={isPremiumLocked}
              onClick={() => {
                if (job.status === "COMPLETED") {
                  onDownload(job.id);
                } else if (job.status === "FAILED") {
                  onRegenerate();
                }
              }}
            >
              {job.status === "COMPLETED"
                ? "Download HD"
                : job.status === "FAILED"
                ? "Try Again"
                : "Processing..."}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
