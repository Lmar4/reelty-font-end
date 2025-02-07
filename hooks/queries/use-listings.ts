"use client";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@/types/prisma-types";

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

export function useListings(userId: string) {
  return useQuery({
    queryKey: ["listings", userId],
    queryFn: () => fetchListings(userId),
    enabled: !!userId,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
    enabled: !!id,
  });
}
