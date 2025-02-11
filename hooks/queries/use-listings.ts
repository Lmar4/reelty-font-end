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
  const response = await fetch(`/api/listings?userId=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }
  return response.json();
}

async function fetchListingById(id: string, token: string): Promise<Listing> {
  const response = await fetch(`/api/listings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch listing");
  }
  return response.json();
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
      return createListing(input, token || "");
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

      const response = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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
