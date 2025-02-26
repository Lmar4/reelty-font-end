"use client";
import { Listing } from "@/types/prisma-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBaseQuery } from "./useBaseQuery";

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
  photos: Array<{ s3Key: string }>;
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

interface ApiError {
  message: string;
  stack?: string;
  details?: unknown;
}

interface ListingLimitError {
  currentCount: number;
  maxAllowed: number;
  currentTier: string;
}

interface CreateListingError {
  message: string;
  limitData?: ListingLimitError;
}

export const useListings = () => {
  const query = useBaseQuery<Listing[]>([LISTINGS_QUERY_KEY], (token) =>
    fetchListings(token)
  );

  // Return an object with the same structure as the previous implementation
  return {
    listings: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

type ListingQueryKey = readonly ["listing", string];

export const useListing = (listingId: string, initialData?: Listing) => {
  return useBaseQuery<Listing>(
    ["listing", listingId] as ListingQueryKey,
    (token) => fetchListingById(listingId, token),
    {
      enabled: !!listingId,
      initialData,
    }
  );
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
          photos: newListing.photos.map((photo) => ({
            id: `temp-${crypto.randomUUID()}`,
            status: "processing",
            s3Key: photo.s3Key,
          })),
        };
        return old ? [...old, optimisticListing] : [optimisticListing];
      });
      return { previousListings };
    },
    onError: (error: unknown, variables, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData(
          [LISTINGS_QUERY_KEY],
          context.previousListings
        );
      }

      let errorMessage = "Failed to create listing";
      let limitData: ListingLimitError | undefined;

      // Check if it's a listing limit error
      if (error instanceof Error) {
        try {
          // First try to parse as JSON
          const parsedError = JSON.parse(error.message);
          if (
            parsedError.error === "Listing limit reached" &&
            parsedError.data
          ) {
            limitData = parsedError.data;
            errorMessage = limitData
              ? `You've reached your limit of ${limitData.maxAllowed} active listings on your ${limitData.currentTier} plan.`
              : "You've reached your listing limit.";
          } else if (parsedError.error === "Insufficient credits") {
            errorMessage =
              "You don't have enough credits to create a new listing.";
          } else {
            errorMessage =
              parsedError.error || parsedError.message || error.message;
          }
        } catch (parseError) {
          // If not JSON, use the error message directly
          errorMessage = error.message;
        }
      } else if (typeof error === "object" && error !== null) {
        // Handle non-Error objects
        const errorObj = error as Record<string, any>;
        errorMessage =
          errorObj.message || errorObj.error || "Unknown error occurred";
      }

      console.error("[CREATE_LISTING_ERROR]", {
        error,
        errorMessage,
        limitData,
      });
      throw { message: errorMessage, limitData } as CreateListingError;
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
