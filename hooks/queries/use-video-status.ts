import { VideoJob } from "@/types/prisma-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { useState } from "react";
import { useBaseQuery } from "./useBaseQuery";
import { ApiResponse } from "@/types/api-types";

interface VideoStatus {
  isProcessing: boolean;
  processingCount: number;
  failedCount: number;
  completedCount: number;
  totalCount: number;
  shouldEndPolling?: boolean;
}

interface VideoResponseData {
  videos: VideoJob[];
  status: VideoStatus;
}

type VideoResponse = ApiResponse<VideoResponseData>;

const transformVideoJob = (job: VideoJob): VideoJob => ({
  ...job,
  createdAt: new Date(job.createdAt),
  updatedAt: new Date(job.updatedAt || job.createdAt),
  startedAt: job.startedAt ? new Date(job.startedAt) : null,
  completedAt: job.completedAt ? new Date(job.completedAt) : null,
  metadata: job.metadata
    ? {
        ...job.metadata,
        startTime: job.metadata.startTime || undefined,
        endTime: job.metadata.endTime || undefined,
      }
    : null,
});

const INITIAL_INTERVAL = 2000; // Start with 2 seconds
const MAX_INTERVAL = 30000; // Max 30 seconds
const MAX_RETRIES = 30; // Stop after 30 retries

export const useVideoStatus = (listingId: string) => {
  const [retryCount, setRetryCount] = useState(0);
  const [interval, setInterval] = useState(INITIAL_INTERVAL);

  return useBaseQuery<VideoResponse>(
    ["videos", listingId],
    async (token) => {
      const response = await makeBackendRequest<VideoResponse>(
        `/api/listings/${listingId}/latest-videos`,
        {
          method: "GET",
          sessionToken: token,
        }
      );

      // Reset retry count and interval on successful response
      setRetryCount(0);
      setInterval(INITIAL_INTERVAL);

      // Transform video jobs if they exist
      if (response.data?.videos) {
        response.data.videos = response.data.videos.map(transformVideoJob);
      }

      return response;
    },
    {
      refetchInterval: (query) => {
        if (retryCount >= MAX_RETRIES) {
          return false;
        }

        const data = query.state.data;
        if (data?.data?.status?.shouldEndPolling) {
          return false;
        }

        setRetryCount((prev) => prev + 1);
        return interval;
      },
      retry: (failureCount, error) => {
        if (error.message.includes("404")) return false;
        if (error.message.includes("429")) {
          setInterval((prev) => Math.min(prev * 2, MAX_INTERVAL));
          return failureCount < MAX_RETRIES;
        }
        return failureCount < MAX_RETRIES;
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * Math.pow(2, attemptIndex), MAX_INTERVAL);
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      enabled: !!listingId,
    }
  );
};
