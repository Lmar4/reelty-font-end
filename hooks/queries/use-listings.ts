"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Listing } from "@/types/prisma-types";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

const LISTINGS_QUERY_KEY = "listings";

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
  userId: string;
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
  const listing = json.data ?? json;

  if (!listing.id) {
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
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create listing");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
      toast.success("Listing created successfully!");
      return data;
    },
    onError: (error: Error) => {
      console.error("[CREATE_LISTING_ERROR]", error);
      toast.error(error.message || "Failed to create listing");
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ listingId, file, order }: UploadPhotoInput) => {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);
      if (order !== undefined) {
        formData.append("order", String(order));
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings/${listingId}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(error.error || "Failed to upload photo");
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("[UPLOAD_PHOTO_ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    },
  });
}
