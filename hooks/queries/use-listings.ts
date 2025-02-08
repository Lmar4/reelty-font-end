"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Listing } from "@/types/prisma-types";
import { toast } from "sonner";

const LISTINGS_QUERY_KEY = "listings";

async function fetchListings(userId: string): Promise<Listing[]> {
  const response = await fetch(`/api/listings?userId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }
  return response.json();
}

async function fetchListingById(id: string): Promise<Listing> {
  const response = await fetch(`/api/listings/${id}`);
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

async function createListing(input: CreateListingInput): Promise<Listing> {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create listing");
  }
  return response.json();
}

interface UploadPhotoInput {
  file: File;
  listingId: string;
  order: number;
}

async function uploadPhoto(
  input: UploadPhotoInput
): Promise<{ filePath: string }> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("order", input.order.toString());

  const response = await fetch(`/api/listings/${input.listingId}/photos`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload photo");
  }
  return response.json();
}

export function useListings(userId: string) {
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, userId],
    queryFn: () => fetchListings(userId),
    enabled: !!userId,
  });
}

export function useListing(id: string, options?: { initialData?: Listing }) {
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, id],
    queryFn: () => fetchListingById(id),
    enabled: !!id,
    initialData: options?.initialData,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
    },
  });
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: uploadPhoto,
    onError: (error) => {
      console.error("[UPLOAD_PHOTO_ERROR]", error);
      toast.error("Failed to upload photo");
    },
  });
}
