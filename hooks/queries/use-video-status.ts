import { useQuery } from "@tanstack/react-query";
import { VideoJob } from "@/types/listing-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

interface VideoResponse {
  success: boolean;
  data: {
    videos: VideoJob[];
    status: {
      isProcessing: boolean;
      processingCount: number;
      failedCount: number;
      completedCount: number;
      totalCount: number;
      shouldEndPolling?: boolean;
    };
  };
}

const transformVideoJob = (job: VideoJob) => ({
  id: job.id,
  listingId: job.listingId,
  userId: job.userId,
  position: job.position,
  priority: job.priority,
  status: job.status,
  progress: job.progress || 0,
  template: job.template,
  inputFiles: job.inputFiles,
  outputFile: job.outputFile,
  thumbnailUrl: job.thumbnailUrl,
  error: job.error || null,
  createdAt: new Date(job.createdAt),
  updatedAt: new Date(job.updatedAt || job.createdAt),
  metadata: {
    userMessage: job.metadata?.userMessage,
    error: job.metadata?.error,
    stage: job.metadata?.stage,
    currentFile: job.metadata?.currentFile,
    totalFiles: job.metadata?.totalFiles,
    startTime: job.metadata?.startTime,
    endTime: job.metadata?.endTime,
  },
});

const INITIAL_INTERVAL = 2000; // Start with 2 seconds
const MAX_INTERVAL = 30000; // Max 30 seconds
const MAX_RETRIES = 30; // Stop after 30 retries

export const useVideoStatus = (listingId: string) => {
  const { getToken } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [interval, setInterval] = useState(INITIAL_INTERVAL);

  return useQuery<VideoResponse, Error>({
    queryKey: ["videos", listingId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No session token available");
      }

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

      // Transform video jobs
      response.data.videos = response.data.videos.map(transformVideoJob);

      return response;
    },
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
  });
};
