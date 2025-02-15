"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { User } from "@/types/prisma-types";

async function getUserData(userId: string, token: string): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
    {
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

  const result = await response.json();
  return result.data;
}

export function useUserData() {
  const { userId, getToken } = useAuth();

  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const token = await getToken();
      return getUserData(userId!, token!);
    },
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
  });

  return query;
}
