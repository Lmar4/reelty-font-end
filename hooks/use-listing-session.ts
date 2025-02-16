import { useCallback, useEffect, useState } from "react";
import { ProcessedPhoto } from "./use-photo-processing";
import { Coordinates } from "@/lib/validations/listing";

export interface ListingSession {
  id: string;
  photos: ProcessedPhoto[];
  address: string;
  coordinates: Coordinates | null;
  createdAt: Date;
}

const SESSION_KEY = "reelty_pending_listing";

export const useListingSession = () => {
  const [session, setSession] = useState<ListingSession | null>(null);

  // Load session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Reconstruct Blobs and URLs from the stored data
        const reconstructedPhotos = parsed.photos.map(
          (photo: ProcessedPhoto) => ({
            ...photo,
            webpBlob: new Blob([photo.webpBlob], { type: "image/webp" }),
            previewUrl: URL.createObjectURL(
              new Blob([photo.webpBlob], { type: "image/webp" })
            ),
          })
        );
        setSession({
          ...parsed,
          photos: reconstructedPhotos,
          createdAt: new Date(parsed.createdAt),
        });
      } catch (error) {
        console.error("Error parsing session:", error);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const saveSession = useCallback(
    async (data: Omit<ListingSession, "id" | "createdAt">) => {
      const newSession: ListingSession = {
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        createdAt: new Date(),
      };

      // Convert Blobs to array buffers for storage
      const photosForStorage = await Promise.all(
        newSession.photos.map(async (photo) => {
          const buffer = await photo.webpBlob.arrayBuffer();
          return {
            ...photo,
            webpBlob: Array.from(new Uint8Array(buffer)),
          };
        })
      );

      const sessionData = {
        ...newSession,
        photos: photosForStorage,
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setSession(newSession);
      return newSession;
    },
    []
  );

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const updateSession = useCallback(
    async (updates: Partial<Omit<ListingSession, "id" | "createdAt">>) => {
      if (!session) return null;

      const updatedSession = {
        ...session,
        ...updates,
      };

      // If photos are being updated, convert Blobs to array buffers
      if (updates.photos) {
        const photosForStorage = await Promise.all(
          updatedSession.photos.map(async (photo) => {
            const buffer = await photo.webpBlob.arrayBuffer();
            return {
              ...photo,
              webpBlob: Array.from(new Uint8Array(buffer)),
            };
          })
        );

        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            ...updatedSession,
            photos: photosForStorage,
          })
        );
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      }

      setSession(updatedSession);
      return updatedSession;
    },
    [session]
  );

  return {
    session,
    saveSession,
    updateSession,
    clearSession,
  };
};
