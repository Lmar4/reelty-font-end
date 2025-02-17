import { useQuery } from "@tanstack/react-query";
import { VideoJob } from "@/types/listing-types";
import { makeBackendRequest, BackendResponse } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";

interface VideoResponse {
  success: boolean;
  videos: any[];
  status: {
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

export const useVideoStatus = (listingId: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["videoStatus", listingId],
    queryFn: async () => {
      const sessionToken = await getToken();
      if (!sessionToken) {
        throw new Error("No session token available");
      }

      const response = await makeBackendRequest<VideoResponse>(
        `/api/listings/${listingId}/latest-videos`,
        {
          method: "GET",
          sessionToken,
        }
      );

      if (!response?.videos) {
        throw new Error("Invalid response format");
      }

      return {
        videos: response.videos.map(transformVideoJob),
        status: response.status,
      };
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      // If we have data and any videos are still processing, refetch every 5 seconds
      if (data?.status.isProcessing) {
        return 5000;
      }
      // Otherwise, don't refetch automatically
      return false;
    },
    // Add retry and backoff logic
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("429")) {
        return failureCount < 3; // Retry up to 3 times for rate limit errors
      }
      return failureCount < 2; // Default to 2 retries for other errors
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 2s, 4s, 8s...
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
    // Refetch settings
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled: !!listingId,
  });
};
