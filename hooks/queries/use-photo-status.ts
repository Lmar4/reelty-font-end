import { makeBackendRequest } from "@/utils/withAuth";
import { useBaseQuery } from "./useBaseQuery";

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
  return useBaseQuery(
    ["photoStatus", listingId],
    async (token) => {
      const response = await makeBackendRequest<PhotoStatusResponse>(
        `/api/listings/${listingId}/photos/status`,
        { sessionToken: token }
      );

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
    {
      refetchInterval: (query) => {
        const data = query.state.data;
        return data?.status === "PROCESSING" ? 5000 : false;
      },
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("429")) {
          return failureCount < 3;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) =>
        Math.min(1000 * Math.pow(2, attemptIndex), 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      enabled: !!listingId,
    }
  );
};
