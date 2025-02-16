import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";

export interface ProcessedPhoto {
  id: string;
  originalFile: File;
  webpBlob: Blob;
  previewUrl: string;
  s3Key?: string;
  status: "idle" | "processing" | "uploaded" | "failed";
  error?: string;
}

interface UsePhotoProcessingOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export const usePhotoProcessing = (options: UsePhotoProcessingOptions = {}) => {
  const [status, setStatus] = useState<
    "idle" | "processing" | "uploading" | "completed" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const defaultOptions = {
    maxSizeMB: 15,
    width: 768,
    height: 1280,
    quality: 0.9, // 90% quality
    ...options,
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const createWebPFromFile = async (file: File): Promise<Blob> => {
    try {
      // First compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: defaultOptions.maxSizeMB,
        maxWidthOrHeight: Math.max(defaultOptions.width, defaultOptions.height),
        useWebWorker: true,
      });

      // Create a canvas element
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context not available");
      }

      // Create a promise to handle image loading
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas dimensions to match backend requirements
          canvas.width = defaultOptions.width;
          canvas.height = defaultOptions.height;

          // Draw image with cover fit (centered and cropped)
          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const x = (canvas.width - img.width * scale) * 0.5;
          const y = (canvas.height - img.height * scale) * 0.5;
          ctx.drawImage(
            img,
            x, y,
            img.width * scale,
            img.height * scale
          );

          // Convert to WebP
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create WebP blob"));
              }
            },
            "image/webp",
            defaultOptions.quality
          );
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        // Load the compressed image
        img.src = URL.createObjectURL(compressedFile);
      });
    } catch (error) {
      console.error("Error converting to WebP:", error);
      throw error;
    }
  };

  const processPhotos = useCallback(
    async (files: File[]): Promise<ProcessedPhoto[]> => {
      try {
        setStatus("processing");
        setProgress(0);
        setError(null);

        const processedPhotos: ProcessedPhoto[] = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            // Convert to WebP
            const webpBlob = await createWebPFromFile(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(webpBlob);

            processedPhotos.push({
              id: generateUniqueId(),
              originalFile: file,
              webpBlob,
              previewUrl,
              status: "processing",
            });

            // Update progress
            setProgress(((i + 1) / totalFiles) * 100);
          } catch (error) {
            console.error(`Error processing photo ${file.name}:`, error);
            processedPhotos.push({
              id: generateUniqueId(),
              originalFile: file,
              webpBlob: new Blob(), // Empty blob for failed conversion
              previewUrl: URL.createObjectURL(file),
              status: "failed",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to process photo",
            });
          }
        }

        setStatus("completed");
        return processedPhotos;
      } catch (error) {
        setStatus("error");
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        throw error;
      }
    },
    [defaultOptions]
  );

  const cleanup = useCallback((photos: ProcessedPhoto[]) => {
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.previewUrl);
    });
  }, []);

  return {
    processPhotos,
    cleanup,
    status,
    progress,
    error,
  };
};
