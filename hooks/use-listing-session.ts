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
  const [sessionData, setSessionData] = useState<ListingSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("listing_session");
      console.log('Checking for listing session:', savedData ? 'Found' : 'Not found');

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Parsed session data:', parsedData);
        setSessionData(parsedData);
      } else {
        console.log('No listing session found');
        setSessionData(null);
      }
    } catch (e) {
      console.error("Failed to parse listing session data:", e);
      clearSession();
    } finally {
      setIsLoading(false);
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
    // Clear all storage
    localStorage.removeItem("upload_session_id");
    localStorage.removeItem("listing_session");
    sessionStorage.removeItem("upload_session_id");
    sessionStorage.removeItem("postSignUpRedirect");
    
    // Reset state with empty data
    setSessionData({
      photos: [],
      address: undefined,
      coordinates: undefined
    });
  };

  const hasSession = () => {
    return !!sessionData && !!localStorage.getItem("upload_session_id");
  };

  return {
    sessionData,
    isLoading,
    savePhotos,
    saveAddress,
    clearSession,
    hasSession,
  };
};
