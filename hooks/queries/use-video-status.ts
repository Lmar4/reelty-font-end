import { useQuery } from "@tanstack/react-query";
import { VideoJob } from "@/types/listing-types";
import { makeBackendRequest } from "@/utils/api";
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

// Add interface for unwrapped response format
interface UnwrappedVideoResponse {
  videos: VideoJob[];
  status?: {
    isProcessing: boolean;
    processingCount: number;
    failedCount: number;
    completedCount: number;
    totalCount: number;
    shouldEndPolling?: boolean;
  };
}

const transformVideoJob = (job: any): VideoJob => ({
  id: job.id,
  listingId: job.listingId,
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

  return useQuery<VideoResponse>({
    queryKey: ["videos", listingId],
    queryFn: async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No session token available");
        }

        const response = await makeBackendRequest<
          VideoResponse | UnwrappedVideoResponse
        >(`/api/listings/${listingId}/latest-videos`, {
          method: "GET",
          sessionToken: token,
        });

        // Reset retry count and interval on successful response
        setRetryCount(0);
        setInterval(INITIAL_INTERVAL);

        // Check if response has the required data structure
        if (!response || typeof response !== "object") {
          console.error("[useVideoStatus] Invalid response format:", response);
          throw new Error("Invalid response format");
        }

        // If the response is already in the correct format (wrapped in data)
        if ("data" in response && "videos" in response.data) {
          return response as VideoResponse;
        }

        // If the response has videos directly at the root level
        if ("videos" in response && Array.isArray(response.videos)) {
          const unwrappedResponse = response as UnwrappedVideoResponse;
          return {
            success: true,
            data: {
              videos: unwrappedResponse.videos.map(transformVideoJob),
              status: unwrappedResponse.status || {
                isProcessing: false,
                processingCount: 0,
                failedCount: 0,
                completedCount: unwrappedResponse.videos.length,
                totalCount: unwrappedResponse.videos.length,
              },
            },
          };
        }

        // If the response is just the videos array (backward compatibility)
        if (Array.isArray(response)) {
          return {
            success: true,
            data: {
              videos: response.map(transformVideoJob),
              status: {
                isProcessing: false,
                processingCount: 0,
                failedCount: 0,
                completedCount: response.length,
                totalCount: response.length,
              },
            },
          };
        }

        console.error("[useVideoStatus] Unhandled response format:", response);
        throw new Error("Invalid response format");
      } catch (error: any) {
        // Handle rate limiting specifically
        if (error?.status === 429) {
          // Implement exponential backoff
          setInterval((prev) => Math.min(prev * 2, MAX_INTERVAL));
          throw new Error("Rate limited, backing off...");
        }
        throw error;
      }
    },
    refetchInterval: (query) => {
      // Stop polling if we hit max retries
      if (retryCount >= MAX_RETRIES) {
        return false;
      }

      const data = query.state.data;

      // Stop polling if we have a final status
      if (data?.data?.status?.shouldEndPolling) {
        return false;
      }

      // Increment retry count
      setRetryCount((prev) => prev + 1);

      // Return current interval
      return interval;
    },
    retry: (failureCount, error: any) => {
      // Don't retry on specific error conditions
      if (error?.status === 404) return false;

      // Limit total retries
      return failureCount < MAX_RETRIES;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff for retries
      return Math.min(1000 * Math.pow(2, attemptIndex), MAX_INTERVAL);
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled: !!listingId,
  });
};
