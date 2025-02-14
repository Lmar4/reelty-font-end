"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Listing } from "@/types/prisma-types";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export const LISTINGS_QUERY_KEY = "listings";

async function fetchListings(
  userId: string,
  token: string
): Promise<Listing[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch listings");
  }

  const result = await response.json();
  return result.data;
}

async function fetchListingById(id: string, token: string): Promise<Listing> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch listing");
  }

  const result = await response.json();
  return result.data;
}

interface CreateListingInput {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  photoLimit: number;
}

async function createListing(
  input: CreateListingInput,
  token: string
): Promise<Listing> {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...input,
      coordinates: input.coordinates
        ? {
            lat: Number(input.coordinates.lat),
            lng: Number(input.coordinates.lng),
          }
        : null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create listing: ${errorText || response.statusText}`
    );
  }

  const json = await response.json();

  // Handle array response
  let listing;
  if (Array.isArray(json.data)) {
    listing = json.data[0];
  } else {
    listing = json.data ?? json;
  }

  if (!listing?.id) {
    throw new Error("Invalid response: missing listing ID");
  }

  return listing;
}

interface UploadPhotoInput {
  file: File;
  listingId: string;
  order?: number;
}

export function useListings(userId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, userId],
    queryFn: async () => {
      const token = await getToken();
      return fetchListings(userId, token || "");
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes before garbage collection
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("Rate limit")) {
        return failureCount < 2; // Only retry once for rate limits
      }
      return failureCount < 2; // Default to 2 retries for other errors
    },
    retryDelay: (attemptIndex) => {
      // For rate limit errors, wait longer
      const baseDelay = 1000 * Math.pow(2, attemptIndex);
      return Math.min(baseDelay, 30000); // Cap at 30 seconds
    },
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnWindowFocus: true, // But do refetch when window regains focus
    refetchOnReconnect: true, // And when internet connection is restored
    structuralSharing: true,
  });
}

export function useListing(id: string, options?: { initialData?: Listing }) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, id],
    queryFn: async () => {
      const token = await getToken();
      return fetchListingById(id, token || "");
    },
    enabled: !!id,
    initialData: options?.initialData,
    refetchInterval: (query) => {
      const data = query.state.data as Listing | undefined;
      // If we have data and any photos are still processing, refetch every 5 seconds
      if (
        data?.photos?.some(
          (p: {
            status: string;
            processedFilePath: string | null;
            error: string | null;
          }) => p.status === "processing" || (!p.processedFilePath && !p.error)
        )
      ) {
        return 5000; // Increased from 2s to 5s
      }
      // Otherwise, don't refetch automatically
      return false;
    },
    // Add retry and backoff logic
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("429")) {
        return failureCount < 3; // Retry up to 3 times for rate limit errors
      }
      return failureCount < 2; // Default to 2 retries for other errors
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 2s, 4s, 8s...
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
    // Refetch settings
    refetchOnWindowFocus: false, // Changed to false to reduce requests
    refetchOnReconnect: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Format coordinates to ensure they are numbers
      const coordinates = input.coordinates
        ? {
            lat: Number(input.coordinates.lat),
            lng: Number(input.coordinates.lng),
          }
        : null;

      // Validate coordinates are valid numbers if they exist
      if (coordinates && (isNaN(coordinates.lat) || isNaN(coordinates.lng))) {
        throw new Error("Invalid coordinates format");
      }

      console.log("[CREATE_LISTING] Input:", input);
      console.log("[CREATE_LISTING] Coordinates:", coordinates);

      const requestBody = {
        address: input.address,
        coordinates,
        photoLimit: input.photoLimit,
        description: "",
      };

      console.log("[CREATE_LISTING] Request body:", requestBody);

      // Use the Next.js API route instead of calling backend directly
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(error.error || "Failed to create listing");
      }

      const result = await response.json();

      // Extract listing from response
      let listing;
      if (Array.isArray(result.data)) {
        listing = result.data[0];
      } else {
        listing = result.data ?? result;
      }

      if (!listing?.id) {
        throw new Error("Invalid response: missing listing ID");
      }

      return listing;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
      toast.success("Listing created successfully!");
      return data;
    },
    onError: (error: Error) => {
      console.error("[CREATE_LISTING_ERROR]", error);
      if (error.message === "User not authenticated") {
        toast.error("Please sign in to create a listing");
      } else {
        toast.error(error.message || "Failed to create listing");
      }
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ listingId, file, order }: UploadPhotoInput) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("file", file);
      if (order !== undefined) {
        formData.append("order", String(order));
      }

      console.log("[UPLOAD_REQUEST]", {
        listingId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        order,
      });

      try {
        // Use the correct Next.js API route
        const response = await fetch(`/api/listings/${listingId}/photos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          throw new Error(
            `Unexpected response type: ${contentType}, body: ${text}`
          );
        }

        return responseData;
      } catch (error) {
        throw new Error("Failed to upload photo");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
      toast.success("Photo uploaded successfully!");
      return data;
    },
    onError: (error: Error) => {
      console.error("[UPLOAD_PHOTO_ERROR]", error);
      toast.error(error.message || "Failed to upload photo");
    },
  });
}
