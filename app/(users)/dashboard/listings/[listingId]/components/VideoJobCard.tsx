"use client";

import React from "react";
import { VideoJob } from "@/types/listing-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { VideoGenerationStatus } from "@/types/prisma-types";

interface VideoJobCardProps {
  job: VideoJob;
  listingId: string;
  isPaidUser: boolean;
  isRegenerating?: boolean;
  onDownload: (jobId: string) => void;
  onRegenerate: () => void;
  downloadCount?: number;
}

export function VideoJobCard({
  job,
  listingId,
  isPaidUser,
  isRegenerating,
  onDownload,
  onRegenerate,
  downloadCount = 0,
}: VideoJobCardProps) {
  const isProcessing = job.status === "PROCESSING";
  const isCompleted = job.status === "COMPLETED";
  const isFailed = job.status === "FAILED";
  const isDownloadLimited = !isPaidUser && downloadCount >= 1;

  // Get the processed template path
  const processedTemplate = job.metadata?.processedTemplates?.find(
    (template) => template.key === job.template
  );
  const videoUrl = processedTemplate?.path || job.outputFile;

  const renderStatus = () => {
    if (isProcessing) {
      return (
        <div className='flex items-center text-blue-600'>
          <LoadingSpinner className='h-4 w-4 mr-2' />
          <span className='text-sm'>Processing</span>
        </div>
      );
    }

    if (isFailed) {
      return <span className='text-sm text-red-600'>Failed</span>;
    }

    if (isCompleted) {
      return <span className='text-sm text-green-600'>Ready</span>;
    }

    return null;
  };

  return (
    <Card className='overflow-hidden'>
      <div className='aspect-video relative'>
        {videoUrl ? (
          <>
            <video
              src={videoUrl}
              className='w-full h-full object-cover'
              controls
            />
            {!isPaidUser && (
              <div className='absolute top-2 right-2'>
                <Badge variant='secondary'>Free Trial</Badge>
              </div>
            )}
          </>
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

        {!isPaidUser && (
          <div className='mb-4'>
            <p className='text-xs text-amber-600'>
              Free trial videos include watermark
            </p>
            <p className='text-xs text-gray-500'>
              {downloadCount}/1 downloads used
            </p>
          </div>
        )}

        <div className='flex space-x-2'>
          {isCompleted && videoUrl && (
            <Button
              onClick={() => onDownload(job.id)}
              disabled={!isPaidUser && isDownloadLimited}
              className='flex-1'
              variant={isPaidUser ? "default" : "outline"}
            >
              {!isPaidUser && isDownloadLimited
                ? "Download Limit Reached"
                : isPaidUser
                ? "Download"
                : "Download (Free Trial)"}
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
