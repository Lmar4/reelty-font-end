"use client";
import { Listing } from "@/types/prisma-types";
import { makeBackendRequest } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  coordinates: { lat: number; lng: number };
  photoLimit: number;
  photos: Array<{ id: string; s3Key: string }>;
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
  s3Key: string;
}

interface UploadResponse {
  success: boolean;
  data: {
    id: string;
    listingId: string;
    userId: string;
    filePath: string;
    s3Key: string;
    order: number;
    status: string;
  };
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

type ListingQueryKey = readonly ["listing", string];

export const useListing = (listingId: string, initialData?: Listing) => {
  const { getToken } = useAuth();

  return useQuery<Listing, Error, Listing, ListingQueryKey>({
    queryKey: ["listing", listingId] as const,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const data = await makeBackendRequest<Listing>(
        `/api/listings/${listingId}`,
        {
          method: "GET",
          sessionToken: token,
        }
      );
      return data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message?.includes("404")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

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

      // Validate that we have photos
      if (!input.photos || input.photos.length === 0) {
        throw new Error("At least one photo is required to create a listing");
      }

      const requestBody = {
        address: input.address,
        coordinates: input.coordinates
          ? {
              lat: Number(input.coordinates.lat),
              lng: Number(input.coordinates.lng),
            }
          : null,
        photoLimit: input.photoLimit,
        description: "",
        photos: input.photos, // Pass the S3 photo information
      };

      try {
        const listing = await makeBackendRequest<Listing>("/api/listings", {
          method: "POST",
          body: requestBody,
          sessionToken: token,
        });

        if (!listing?.id) {
          throw new Error("Invalid response: missing listing ID");
        }

        return listing;
      } catch (error) {
        console.error("[CREATE_LISTING_ERROR]", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to create listing"
        );
      }
    },
    onMutate: async (newListing) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [LISTINGS_QUERY_KEY] });

      // Snapshot the previous value
      const previousListings = queryClient.getQueryData([LISTINGS_QUERY_KEY]);

      // Optimistically update to the new value
      queryClient.setQueryData([LISTINGS_QUERY_KEY], (old: any) => {
        const optimisticListing = {
          id: "temp-" + Date.now(),
          address: newListing.address,
          coordinates: newListing.coordinates,
          status: "creating",
          createdAt: new Date().toISOString(),
          photos: [],
        };
        return old ? [...old, optimisticListing] : [optimisticListing];
      });

      return { previousListings };
    },
    onError: (error: Error, variables, context) => {
      // Revert back to the previous value if there's an error
      if (context?.previousListings) {
        queryClient.setQueryData(
          [LISTINGS_QUERY_KEY],
          context.previousListings
        );
      }

      if (error.message === "User not authenticated") {
        toast.error("Please sign in to create a listing");
      } else {
        toast.error(error.message || "Failed to create listing");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
      toast.success("Listing created successfully!");
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ listingId, file, order, s3Key }: UploadPhotoInput) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const body = {
        s3Key,
        order: order !== undefined ? String(order) : undefined,
      };

      try {
        const result = await makeBackendRequest<UploadResponse>(
          `/api/listings/${listingId}/photos`,
          {
            method: "POST",
            sessionToken: token,
            headers: {
              "Content-Type": "application/json",
            },
            body,
          }
        );

        if (!result || typeof result !== "object") {
          throw new Error("Invalid response from server");
        }

        // makeBackendRequest already validates success and returns the data
        // so we just need to check if we have the expected fields
        if (!result) {
          throw new Error("Unexpected response format from server");
        }

        return result;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to upload photo"
        );
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [LISTINGS_QUERY_KEY, variables.listingId],
      });

      const previousListing = queryClient.getQueryData([
        LISTINGS_QUERY_KEY,
        variables.listingId,
      ]);

      // Optimistically update the listing with the new photo
      queryClient.setQueryData(
        [LISTINGS_QUERY_KEY, variables.listingId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            photos: [
              ...(old.photos || []),
              {
                id: "temp-" + Date.now(),
                listingId: variables.listingId,
                order: variables.order,
                status: "uploading",
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
      );

      return { previousListing };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousListing) {
        queryClient.setQueryData(
          [LISTINGS_QUERY_KEY, variables.listingId],
          context.previousListing
        );
      }
      toast.error(error.message || "Failed to upload photo");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LISTINGS_QUERY_KEY, variables.listingId],
      });
      toast.success("Photo uploaded successfully!");
    },
  });
}
