import { useQuery } from "@tanstack/react-query";
import { makeBackendRequest, BackendResponse } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";

interface PhotoStatusResponse {
  processingCount: number;
  failedCount: number;
  totalCount: number;
  photos: {
    id: string;
    url: string;
    hasError: boolean;
    status: "error" | "processing" | "completed";
    order: number;
  }[];
}

export const usePhotoStatus = (listingId: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["photoStatus", listingId],
    queryFn: async () => {
      const sessionToken = await getToken();
      if (!sessionToken) {
        throw new Error("No session token available");
      }

      const response = await makeBackendRequest<PhotoStatusResponse>(
        `/api/listings/${listingId}/photos/status`,
        {
          method: "GET",
          sessionToken,
        }
      );

      if (!response) {
        throw new Error("Invalid response format");
      }

      return {
        status:
          response.processingCount > 0
            ? "PROCESSING"
            : response.failedCount > 0
            ? "ERROR"
            : response.totalCount > 0
            ? "COMPLETED"
            : null,
        message:
          response.processingCount > 0
            ? `Processing ${response.processingCount} of ${response.totalCount} photos...`
            : response.failedCount > 0
            ? `${response.failedCount} photos failed to process`
            : response.totalCount > 0
            ? "All photos processed successfully"
            : "",
        processingCount: response.processingCount,
        failedCount: response.failedCount,
        totalCount: response.totalCount,
        photos: response.photos,
      };
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      // If we have data and photos are still processing, refetch every 5 seconds
      if (data?.status === "PROCESSING") {
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
