import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { VideoGenerationStatus, PhotoProcessingStatus } from "@/types/status";

type StatusState = {
  status: VideoGenerationStatus;
  message: string;
} | null;

export const usePhotoProcessingStatus = (listingId: string) => {
  const [status, setStatus] = useState<StatusState>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToStream = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Create EventSource connection
        eventSource = new EventSource(
          `/api/listings/${listingId}/photos/status`,
          {
            withCredentials: true,
          }
        );

        // Handle incoming messages
        eventSource.onmessage = (event) => {
          try {
            const data: PhotoProcessingStatus = JSON.parse(event.data);
            const { processingCount, failedCount, totalCount } = data;

            if (processingCount > 0) {
              setStatus({
                status: VideoGenerationStatus.PROCESSING,
                message: `Processing ${processingCount} of ${totalCount} photos...`,
              });
            } else if (failedCount > 0) {
              setStatus({
                status: VideoGenerationStatus.FAILED,
                message: `${failedCount} photos failed to process`,
              });
            } else {
              setStatus({
                status: VideoGenerationStatus.COMPLETED,
                message: "All photos processed successfully",
              });
              eventSource?.close();
            }
          } catch (err) {
            console.error("[PHOTO_STATUS_PARSE_ERROR]", err);
          }
        };

        // Handle connection errors
        eventSource.onerror = () => {
          console.error("[PHOTO_STATUS_CONNECTION_ERROR]");
          eventSource?.close();
        };
      } catch (err) {
        console.error("[PHOTO_STATUS_ERROR]", err);
      }
    };

    connectToStream();

    // Cleanup
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [listingId, getToken]);

  return status;
};
