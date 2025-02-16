import { useState, useCallback } from "react";
import { ProcessedPhoto } from "./use-photo-processing";

interface UploadProgress {
  [key: string]: number;
}

interface UploadResult {
  id: string;
  s3Key: string;
  url: string;
}

export const useS3Upload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);

  const getPresignedUrl = async (
    filename: string,
    contentType: string
  ): Promise<{ url: string; key: string }> => {
    const response = await fetch("/api/storage/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    return response.json();
  };

  const uploadToS3 = useCallback(
    async (photos: ProcessedPhoto[]): Promise<UploadResult[]> => {
      try {
        setIsUploading(true);
        setUploadProgress({});

        const results: UploadResult[] = [];
        const uploadErrors: Array<{ id: string; error: string }> = [];

        for (const photo of photos) {
          try {
            // Get presigned URL for this photo
            const { url: presignedUrl, key: s3Key } = await getPresignedUrl(
              `${photo.id}.webp`,
              "image/webp"
            );

            // Upload to S3 with progress tracking
            const xhr = new XMLHttpRequest();

            await new Promise<void>((resolve, reject) => {
              xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                  const progress = (event.loaded / event.total) * 100;
                  setUploadProgress((prev) => ({
                    ...prev,
                    [photo.id]: progress,
                  }));
                }
              });

              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  results.push({
                    id: photo.id,
                    s3Key,
                    url: `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
                  });
                  resolve();
                } else {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              });

              xhr.addEventListener("error", () => {
                uploadErrors.push({
                  id: photo.id,
                  error: "Upload failed",
                });
                reject(new Error("Upload failed"));
              });

              xhr.open("PUT", presignedUrl);
              xhr.setRequestHeader("Content-Type", "image/webp");
              xhr.send(photo.webpBlob);
            });
          } catch (error) {
            console.error(`Failed to upload photo ${photo.id}:`, error);
            uploadErrors.push({
              id: photo.id,
              error: error instanceof Error ? error.message : "Upload failed",
            });
            throw error;
          }
        }

        // After all uploads are complete, update the backend with the status of all photos
        await Promise.all(
          results.map((result) =>
            fetch(`/api/photos/${result.id}/status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                s3Key: result.s3Key,
                status: "completed",
              }),
            })
          )
        );

        // Also update failed photos if any
        await Promise.all(
          uploadErrors.map((error) =>
            fetch(`/api/photos/${error.id}/status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "error",
                error: error.error,
              }),
            })
          )
        );

        return results;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const getUploadProgress = useCallback(
    (photoId: string) => {
      return uploadProgress[photoId] || 0;
    },
    [uploadProgress]
  );

  return {
    uploadToS3,
    getUploadProgress,
    isUploading,
    uploadProgress,
  };
};
