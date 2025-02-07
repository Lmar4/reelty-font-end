"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { VideoJob } from "@/types/prisma-types";
import { RefreshCw } from "lucide-react";

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
    <div
      className={`relative rounded-lg overflow-hidden ${
        isPremiumLocked ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {job.status === "processing" ? (
        <div className='w-full aspect-video bg-gray-100 flex items-center justify-center'>
          <LoadingState
            text='Processing video...'
            size='sm'
            className='min-h-0'
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
            : "Basic"}
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
                onClick={onRegenerate}
                className='text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1'
              >
                <RefreshCw className='w-3 h-3' />
                Regenerate
              </button>
            )}
          </div>
          {job.status === "completed" && (
            <button
              onClick={() => onDownload(job.id)}
              disabled={isPremiumLocked}
              className={`px-4 py-2 rounded-lg ${
                isPremiumLocked
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Download
            </button>
          )}
        </div>
        {isPremiumLocked && (
          <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
            <span className='text-white text-lg font-semibold'>
              Premium Template
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
