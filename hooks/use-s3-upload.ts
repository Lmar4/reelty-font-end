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

interface UseS3UploadReturn {
  uploadToS3: (
    files: File[],
    isListing?: boolean,
    onProgress?: (progress: number) => void
  ) => Promise<UploadResult[]>;
  isUploading: boolean;
  uploadProgress: number;
}

interface PresignedUrlResponse {
  url: string;
  key: string;
  sessionId?: string;
}

export function useS3Upload() {
  return async function uploadToS3(
    files: File[],
    isListing: boolean = false,
    onProgress?: (progress: number) => void
  ) {
    const results = [];

    for (const [index, file] of files.entries()) {
      // Generate a unique ID for this upload
      const uploadId = crypto.randomUUID();

      // Determine the temp path
      const tempKey = `temp/${uploadId}/${file.name}`;

      // Get presigned URL for upload
      const presignedUrl = await fetch("/api/s3/presigned-url", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          tempKey,
        }),
      }).then((r) => r.json());

      // Upload file
      await fetch(presignedUrl.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Track progress
      if (onProgress) {
        onProgress((index + 1) * (100 / files.length));
      }

      results.push({
        id: uploadId,
        s3Key: tempKey,
        url: `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${tempKey}`,
      });
    }

    return results;
  };
}

export const useS3UploadOld = (): UseS3UploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        }),
      });

      const responseText = await response.text();
      console.log("[PRESIGNED_URL] Raw response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        isTemporary,
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

      console.log("[PRESIGNED_URL] Successfully got URL:", {
        key: data.key,
        hasUrl: !!data.url,
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

  const uploadToS3 = async (
    files: File[],
    isListing?: boolean,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    try {
      const results: UploadResult[] = [];
      const uploadErrors: Array<{ id: string; error: string }> = [];

      for (const [index, file] of files.entries()) {
        try {
          console.log("[S3_UPLOAD] Starting upload for file:", {
            index,
            fileName: file.name,
            contentType: file.type,
          });

          // Get presigned URL for this file
          const { url: presignedUrl, key: s3Key } = await getPresignedUrl(
            file.name,
            file.type,
            isListing
          );

          console.log("[S3_UPLOAD] Got presigned URL:", {
            presignedUrl,
            s3Key,
          });

          // Upload to S3 with progress tracking
          const xhr = new XMLHttpRequest();

          await new Promise<void>((resolve, reject) => {
            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                setUploadProgress(progress);
                onProgress?.(progress);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                console.log("[S3_UPLOAD] Upload successful:", {
                  id: file.name,
                  s3Key,
                  status: xhr.status,
                });

                results.push({
                  id: file.name,
                  s3Key,
                  url: s3Key, // Just pass the key, backend will construct full URL
                });
                resolve();
              } else {
                console.error("[S3_UPLOAD] Upload failed:", {
                  id: file.name,
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
                id: file.name,
                status: xhr.status,
                response: xhr.responseText,
              });

              uploadErrors.push({
                id: file.name,
                error: "Network error during upload",
              });
              reject(new Error("Network error during upload"));
            });

            xhr.open("PUT", presignedUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          });
        } catch (error) {
          console.error("[S3_UPLOAD] Error uploading file:", {
            id: file.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          uploadErrors.push({
            id: file.name,
            error: error instanceof Error ? error.message : "Upload failed",
          });
          continue; // Continue with next file instead of throwing
        }
      }

      // After all uploads are complete, update the backend with the status
      if (results.length > 0) {
        console.log("[S3_UPLOAD] Updating file statuses:", {
          successful: results.length,
          failed: uploadErrors.length,
        });

        await Promise.all(
          results.map((result) =>
            fetch(`/api/files/${result.id}/status`, {
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
      }

      // Update failed files if any
      if (uploadErrors.length > 0) {
        await Promise.all(
          uploadErrors.map((error) =>
            fetch(`/api/files/${error.id}/status`, {
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
      }

      if (uploadErrors.length === files.length) {
        throw new Error("All file uploads failed");
      }

      return results;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToS3,
    isUploading,
    uploadProgress,
  };
};
