import { useState, useCallback } from "react";
import { ProcessedPhoto } from "./use-photo-processing";

interface UploadProgress {
  [key: string]: number;
}

export interface UploadResult {
  id: string;
  s3Key: string;
  url: string;
  sessionId?: string;
}

interface PresignedUrlResponse {
  url: string;
  key: string;
  sessionId?: string;
}

export const useS3Upload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return (
      sessionStorage.getItem("upload_session_id") ||
      localStorage.getItem("upload_session_id")
    );
  });

  const getPresignedUrl = async (
    filename: string,
    contentType: string,
    isTemporary: boolean = false
  ): Promise<PresignedUrlResponse> => {
    try {
      console.log("[PRESIGNED_URL] Requesting URL:", {
        filename,
        contentType,
        isTemporary,
        sessionId,
      });

      const response = await fetch("/api/storage/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          filename,
          contentType,
          isTemporary,
          ...(isTemporary && sessionId && { sessionId }), // Only include sessionId if it exists and isTemporary is true
        }),
      });

      const responseText = await response.text();
      console.log("[PRESIGNED_URL] Raw response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        isTemporary,
        sessionId,
        url: response.url,
      });

      let data;
      try {
        data = JSON.parse(responseText);

        // Check for auth required response
        if (data.authRequired || response.status === 401) {
          console.log("[PRESIGNED_URL] Auth required from API", {
            status: response.status,
            isTemporary,
            data,
          });
          throw new Error("AUTH_REQUIRED");
        }
      } catch (e) {
        // If it's not JSON and looks like HTML, it's probably a redirect
        if (responseText.trim().startsWith("<!DOCTYPE html>")) {
          console.log("[PRESIGNED_URL] HTML redirect detected");
          throw new Error("AUTH_REQUIRED");
        }
        console.error("[PRESIGNED_URL_ERROR] Failed to parse JSON response:", {
          error: e instanceof Error ? e.message : "Unknown error",
          responseText,
        });
        throw e;
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to get presigned URL: ${response.statusText}`
        );
      }

      if (!data.url || !data.key) {
        console.error("[PRESIGNED_URL_ERROR] Invalid response data:", data);
        throw new Error("Invalid response: missing url or key");
      }

      // Store the session ID if this is a temporary upload
      if (isTemporary && data.sessionId) {
        setSessionId(data.sessionId);
        const sessionId = data.sessionId;
        localStorage.setItem("upload_session_id", sessionId);
        sessionStorage.setItem("upload_session_id", sessionId);
      }

      console.log("[PRESIGNED_URL] Successfully got URL:", {
        key: data.key,
        hasUrl: !!data.url,
        sessionId: data.sessionId,
      });

      return data;
    } catch (error) {
      console.error("[PRESIGNED_URL_ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  const uploadToS3 = useCallback(
    async (
      photos: ProcessedPhoto[],
      isTemporary: boolean = !sessionId, // Default to temporary if no session
      onProgress?: (progress: number) => void
    ): Promise<UploadResult[]> => {
      try {
        setIsUploading(true);
        setUploadProgress({});

        const results: UploadResult[] = [];
        const uploadErrors: Array<{ id: string; error: string }> = [];

        for (const photo of photos) {
          try {
            console.log("[S3_UPLOAD] Starting upload for photo:", {
              id: photo.id,
              contentType: "image/webp",
              isTemporary,
              sessionId,
            });

            // Get presigned URL for this photo
            const {
              url: presignedUrl,
              key: s3Key,
              sessionId: newSessionId,
            } = await getPresignedUrl(
              `${photo.id}.webp`,
              "image/webp",
              isTemporary
            );

            console.log("[S3_UPLOAD] Got presigned URL:", {
              presignedUrl,
              s3Key,
              sessionId: newSessionId,
            });

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

                  // Calculate overall progress
                  const progressValues = Object.values(uploadProgress);
                  const overallProgress = progressValues.length > 0
                    ? progressValues.reduce((a, b) => a + b, 0) / (photos.length * 100) * 100
                    : 0;
                  onProgress?.(overallProgress);
                }
              });

              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  console.log("[S3_UPLOAD] Upload successful:", {
                    id: photo.id,
                    s3Key,
                    status: xhr.status,
                  });

                  results.push({
                    id: photo.id,
                    s3Key,
                    url: s3Key, // Just pass the key, backend will construct full URL
                    sessionId: newSessionId,
                  });
                  resolve();
                } else {
                  console.error("[S3_UPLOAD] Upload failed:", {
                    id: photo.id,
                    status: xhr.status,
                    response: xhr.responseText,
                  });
                  reject(
                    new Error(
                      `Upload failed with status ${xhr.status}: ${xhr.responseText}`
                    )
                  );
                }
              });

              xhr.addEventListener("error", () => {
                console.error("[S3_UPLOAD] Network error:", {
                  id: photo.id,
                  status: xhr.status,
                  response: xhr.responseText,
                });

                uploadErrors.push({
                  id: photo.id,
                  error: "Network error during upload",
                });
                reject(new Error("Network error during upload"));
              });

              xhr.open("PUT", presignedUrl);
              xhr.setRequestHeader("Content-Type", "image/webp");
              xhr.send(photo.webpBlob);
            });
          } catch (error) {
            console.error("[S3_UPLOAD] Error uploading photo:", {
              id: photo.id,
              error: error instanceof Error ? error.message : "Unknown error",
            });

            uploadErrors.push({
              id: photo.id,
              error: error instanceof Error ? error.message : "Upload failed",
            });
            continue; // Continue with next photo instead of throwing
          }
        }

        // After all uploads are complete, update the backend with the status
        if (results.length > 0) {
          console.log("[S3_UPLOAD] Updating photo statuses:", {
            successful: results.length,
            failed: uploadErrors.length,
            sessionId,
          });

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
                  sessionId: result.sessionId,
                }),
              })
            )
          );
        }

        // Update failed photos if any
        if (uploadErrors.length > 0) {
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
                  sessionId,
                }),
              })
            )
          );
        }

        if (uploadErrors.length === photos.length) {
          throw new Error("All photo uploads failed");
        }

        return results;
      } catch (error) {
        console.error("[S3_UPLOAD] Fatal error:", error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [sessionId]
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
    sessionId,
  };
};
