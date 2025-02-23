"use client";

import { VideoJob } from "@/types/listing-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";

interface VideoJobCardProps {
  job: VideoJob;
  listingId: string;
  isPaidUser: boolean;
  isRegenerating?: boolean;
  onDownload: (jobId: string) => void;
  onRegenerate: () => void;
}

export function VideoJobCard({
  job,
  listingId,
  isPaidUser,
  isRegenerating,
  onDownload,
  onRegenerate,
}: VideoJobCardProps) {
  const isProcessing = job.status === "PROCESSING";
  const isFailed = job.status === "FAILED";
  const isCompleted = job.status === "COMPLETED";

  const renderStatus = () => {
    if (isProcessing) {
      return (
        <div className='flex items-center space-x-2 text-blue-600'>
          <LoadingSpinner className='h-4 w-4' />
          <span>Processing...</span>
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className='flex items-center space-x-2 text-red-600'>
          <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          <span>Failed</span>
        </div>
      );
    }

    if (isCompleted) {
      return (
        <div className='flex items-center space-x-2 text-green-600'>
          <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          <span>Ready</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className='overflow-hidden'>
      <div className='aspect-video relative'>
        {job.outputFile ? (
          <video
            src={job.outputFile}
            className='w-full h-full object-cover'
            controls
            poster={job.thumbnailUrl || undefined}
          />
        ) : (
          <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
            <svg
              className='h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}
      </div>

      <div className='p-4'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-lg font-semibold capitalize'>
            {job.template || "Video"}
          </h3>
          {renderStatus()}
        </div>

        <div className='text-sm text-gray-500 mb-4'>
          Created{" "}
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </div>

        {job.error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700'>
            {job.error}
          </div>
        )}

        <div className='flex space-x-2'>
          {isCompleted && (
            <Button
              onClick={() => onDownload(job.id)}
              disabled={!isPaidUser}
              className='flex-1'
              variant={isPaidUser ? "default" : "outline"}
            >
              {isPaidUser ? "Download" : "Upgrade to Download"}
            </Button>
          )}

          {(isFailed || isCompleted) && (
            <Button
              onClick={onRegenerate}
              disabled={isRegenerating}
              variant='outline'
              className='flex-shrink-0'
            >
              {isRegenerating ? (
                <LoadingSpinner className='h-4 w-4' />
              ) : (
                <svg
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
