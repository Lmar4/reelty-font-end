import { makeBackendRequest } from "@/utils/withAuth";
import { useBaseQuery } from "./useBaseQuery";
import { ApiResponse } from "@/types/api-types";

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

interface ProcessedPhotoStatus {
  status: "PROCESSING" | "ERROR" | "COMPLETED" | null;
  message: string;
  processingCount: number;
  failedCount: number;
  totalCount: number;
  photos: PhotoStatusResponse["photos"];
}

export const usePhotoStatus = (listingId: string) => {
  return useBaseQuery<ProcessedPhotoStatus>(
    ["photoStatus", listingId],
    async (token) => {
      const response = await makeBackendRequest<
        ApiResponse<PhotoStatusResponse>
      >(`/api/listings/${listingId}/photos/status`, { sessionToken: token });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch photo status");
      }

      const data = response.data;
      return {
        success: true,
        data: {
          status:
            data.processingCount > 0
              ? "PROCESSING"
              : data.failedCount > 0
              ? "ERROR"
              : data.totalCount > 0
              ? "COMPLETED"
              : null,
          message:
            data.processingCount > 0
              ? `Processing ${data.processingCount} of ${data.totalCount} photos...`
              : data.failedCount > 0
              ? `${data.failedCount} photos failed to process`
              : data.totalCount > 0
              ? "All photos processed successfully"
              : "",
          processingCount: data.processingCount,
          failedCount: data.failedCount,
          totalCount: data.totalCount,
          photos: data.photos,
        },
      };
    },
    {
      refetchInterval: (query) => {
        const data = query.state.data?.data;
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
