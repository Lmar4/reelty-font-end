"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VideoJob } from "@/types/listing-types";
import { RefreshCw } from "lucide-react";
import Image from "next/image";

interface VideoJobCardProps {
  job: VideoJob;
  isPaidUser: boolean;
  onDownload: (jobId: string) => void;
  onRegenerate: () => void;
}

export function VideoJobCard({
  job,
  isPaidUser,
  onDownload,
  onRegenerate,
}: VideoJobCardProps) {
  const isBasicTemplate = job.template === "basic";
  const isPremiumLocked = !isPaidUser && !isBasicTemplate;

  return (
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
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-sm text-muted-foreground'>
            {job.status === "COMPLETED"
              ? "Ready to download"
              : job.status === "FAILED"
              ? "Failed to generate"
              : "Processing..."}
          </span>
        </div>
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
            className='w-full mt-4'
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
  );
}
