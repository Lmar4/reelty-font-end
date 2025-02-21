"use client";
import { Listing } from "@/types/prisma-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const LISTINGS_QUERY_KEY = "listings";

async function fetchListings(token: string): Promise<Listing[]> {
  return makeBackendRequest<Listing[]>("/api/listings", {
    sessionToken: token,
  });
}

async function fetchListingById(id: string, token: string): Promise<Listing> {
  return makeBackendRequest<Listing>(`/api/listings/${id}`, {
    sessionToken: token,
  });
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
  const requestBody = {
    ...input,
    coordinates: input.coordinates
      ? {
          lat: Number(input.coordinates.lat),
          lng: Number(input.coordinates.lng),
        }
      : null,
  };
  return makeBackendRequest<Listing>("/api/listings", {
    method: "POST",
    body: requestBody,
    sessionToken: token,
  });
}

interface UploadPhotoInput {
  file: File;
  listingId: string;
  order?: number;
  s3Key: string;
}

interface UploadResponse {
  id: string;
  listingId: string;
  userId: string;
  filePath: string;
  s3Key: string;
  order: number;
  status: string;
}

export function useListings() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      return fetchListings(token);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("Rate limit")) {
        return failureCount < 2;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) =>
      Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
      if (!token) throw new Error("Authentication token not found");
      return fetchListingById(listingId, token);
    },
    initialData,
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
      if (!userId) throw new Error("User not authenticated");
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      return createListing(input, token);
    },
    onMutate: async (newListing) => {
      await queryClient.cancelQueries({ queryKey: [LISTINGS_QUERY_KEY] });
      const previousListings = queryClient.getQueryData([LISTINGS_QUERY_KEY]);
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
      if (context?.previousListings) {
        queryClient.setQueryData(
          [LISTINGS_QUERY_KEY],
          context.previousListings
        );
      }
      toast.error(error.message || "Failed to create listing");
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
      if (!token) throw new Error("Authentication token not found");
      const body = {
        s3Key,
        order: order !== undefined ? String(order) : undefined,
      };
      return makeBackendRequest<UploadResponse>(
        `/api/listings/${listingId}/photos`,
        {
          method: "POST",
          sessionToken: token,
          body,
        }
      );
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [LISTINGS_QUERY_KEY, variables.listingId],
      });
      const previousListing = queryClient.getQueryData([
        LISTINGS_QUERY_KEY,
        variables.listingId,
      ]);
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
