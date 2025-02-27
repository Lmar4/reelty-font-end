"use client";
import { Listing, VideoJob } from "@/types/prisma-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBaseQuery } from "./useBaseQuery";
import type { ExtendedListing } from "@/types/listing-types";
import { ApiResponse } from "@/types/api-types";

export const LISTINGS_QUERY_KEY = "listings";

interface CreateListingInput {
  address: string;
  coordinates: { lat: number; lng: number };
  photoLimit: number;
  photos: Array<{ s3Key: string }>;
}

async function fetchListings(token: string): Promise<ApiResponse<Listing[]>> {
  return makeBackendRequest<ApiResponse<Listing[]>>("/api/listings", {
    sessionToken: token,
  });
}

async function fetchListingById(
  id: string,
  token: string
): Promise<ApiResponse<Listing>> {
  return makeBackendRequest<ApiResponse<Listing>>(`/api/listings/${id}`, {
    sessionToken: token,
  });
}

async function createListing(
  input: CreateListingInput,
  token: string
): Promise<ApiResponse<Listing>> {
  const requestBody = {
    ...input,
    coordinates: input.coordinates
      ? {
          lat: Number(input.coordinates.lat),
          lng: Number(input.coordinates.lng),
        }
      : null,
  };
  return makeBackendRequest<ApiResponse<Listing>>("/api/listings", {
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
  const { getToken } = useAuth();

  const query = useBaseQuery<Listing[]>([LISTINGS_QUERY_KEY], async (token) => {
    const response = await fetchListings(token);

    // If we have a successful response with data, return it
    if (response.success && Array.isArray(response.data)) {
      return response;
    }

    // If we have an error message, throw it
    if (response.error) {
      throw new Error(response.error);
    }

    // If we don't have data but the response was successful, return empty array
    return { success: true, data: [] };
  });

  return {
    listings: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

type ListingQueryKey = readonly ["listing", string];

export const useListing = (
  listingId: string,
  initialData?: ExtendedListing
) => {
  return useBaseQuery<ExtendedListing>(
    ["listing", listingId],
    async (token) => {
      const response = await fetchListingById(listingId, token);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch listing");
      }

      // Convert the regular Listing to ExtendedListing
      const extendedListing: ExtendedListing = {
        ...response.data,
        videoJobs: Array.isArray(response.data.videoJobs)
          ? response.data.videoJobs
          : [],
      };

      return {
        success: true,
        data: extendedListing,
      };
    },
    {
      enabled: !!listingId,
      initialData: initialData
        ? {
            success: true,
            data: initialData,
          }
        : undefined,
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
      const response = await createListing(input, token);
      if (!response.success) {
        throw new Error(response.error || "Failed to create listing");
      }
      return response.data;
    },
    onMutate: async (newListing) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [LISTINGS_QUERY_KEY] });

      // Snapshot the previous value
      const previousListings =
        queryClient.getQueryData<ApiResponse<Listing[]>>([LISTINGS_QUERY_KEY])
          ?.data || [];

      // Create an optimistic listing
      const optimisticListing: Partial<Listing> = {
        id: `temp-${Date.now()}`,
        address: newListing.address,
        coordinates: newListing.coordinates,
        status: "creating",
        createdAt: new Date(),
        photos:
          newListing.photos?.map((photo) => ({
            id: `temp-${crypto.randomUUID()}`,
            userId: userId || "",
            listingId: `temp-${Date.now()}`,
            status: "processing",
            s3Key: photo.s3Key,
            filePath: "",
            processedFilePath: null,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            error: null,
            runwayVideoPath: null,
            metadata: null,
          })) || [],
      };

      // Optimistically update to the new value
      queryClient.setQueryData<ApiResponse<Listing[]>>([LISTINGS_QUERY_KEY], {
        success: true,
        data: [...previousListings, optimisticListing as Listing],
      });

      return { previousListings };
    },
    onError: (error: unknown, variables, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData<ApiResponse<Listing[]>>([LISTINGS_QUERY_KEY], {
          success: true,
          data: context.previousListings,
        });
      }

      let errorMessage = "Failed to create listing";
      let limitData: ListingLimitError | undefined;

      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          if (
            parsedError.error === "Listing limit reached" &&
            parsedError.data
          ) {
            limitData = parsedError.data;
            errorMessage =
              (limitData &&
                `You've reached your limit of ${limitData.maxAllowed} active listings on your ${limitData.currentTier} plan.`) ||
              "You've reached your listing limit.";
          } else if (parsedError.error === "Insufficient credits") {
            errorMessage =
              "You don't have enough credits to create a new listing.";
          }
        } catch {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
      toast.success("Listing created successfully");
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
