"use client";

import { useBaseQuery } from "./queries/useBaseQuery";
import { UserResource } from "@/types/api-types";
import { useAuth } from "@clerk/nextjs";
import { logger } from "@/utils/logger";
import { ApiResponse } from "@/types/api-types";

async function getUserData(
  token: string,
  userId: string
): Promise<ApiResponse<UserResource>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user data");
  }

  const result = (await response.json()) as UserResource;

  // Log the received data for debugging
  logger.debug("Received user data:", result);

  return { success: true, data: result };
}

export function useUserData() {
  const { userId } = useAuth();

  const query = useBaseQuery<UserResource>(
    ["user", userId],
    (token) => getUserData(token, userId ?? ""),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes
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
      // Add refetch configurations
      refetchOnMount: false, // Don't refetch on mount if we have cached data
      refetchOnWindowFocus: true, // But do refetch when window regains focus
      refetchOnReconnect: true, // And when internet connection is restored
      // Structural sharing to prevent unnecessary rerenders
      structuralSharing: true,
    }
  );

  // Return a more convenient object with the actual user data directly accessible
  return {
    ...query,
    data: query.data?.data, // Extract the actual user data from the nested structure
  };
}
