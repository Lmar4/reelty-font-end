import { useState, useEffect } from "react";

interface ListingSessionData {
  photos: Array<{
    id: string;
    s3Key: string;
    url: string;
  }>;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const useListingSession = () => {
  const [sessionData, setSessionData] = useState<ListingSessionData | null>(
    null
  );

  // Load session data on mount
  useEffect(() => {
    const uploadSessionId = localStorage.getItem("upload_session_id");
    const savedData = localStorage.getItem("listing_session");

    if (uploadSessionId && savedData) {
      try {
        setSessionData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse listing session data:", e);
        clearSession();
      }
    } else {
      // Initialize with empty photos array if no session exists
      setSessionData({ photos: [] });
    }
  }, []);

  const savePhotos = (
    photos: Array<{ id: string; s3Key: string; url: string }>
  ) => {
    const newData: ListingSessionData = {
      photos,
      ...(sessionData?.address ? { address: sessionData.address } : {}),
      ...(sessionData?.coordinates
        ? { coordinates: sessionData.coordinates }
        : {}),
    };
    setSessionData(newData);
    localStorage.setItem("listing_session", JSON.stringify(newData));
  };

  const saveAddress = (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => {
    const newData: ListingSessionData = {
      photos: sessionData?.photos || [],
      address,
      coordinates,
    };
    setSessionData(newData);
    localStorage.setItem("listing_session", JSON.stringify(newData));
  };

  const clearSession = () => {
    localStorage.removeItem("upload_session_id");
    localStorage.removeItem("listing_session");
    setSessionData({ photos: [] });
  };

  const hasSession = () => {
    return !!sessionData && !!localStorage.getItem("upload_session_id");
  };

  return {
    sessionData,
    savePhotos,
    saveAddress,
    clearSession,
    hasSession,
  };
};
