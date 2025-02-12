"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { User } from "@/types/prisma-types";

const USER_QUERY_KEY = "user";

async function fetchUserData(userId: string, token: string): Promise<User> {
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

async function updateUser(data: {
  id: string;
  name: string;
  email: string;
  token: string;
}): Promise<User> {
  const response = await fetch(`/api/users/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  return response.json();
}

export function useUserData() {
  const { userId, getToken } = useAuth();

  return useQuery({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: async () => {
      const token = await getToken();
      return fetchUserData(userId!, token!);
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
}

export function useUpdateUser() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; email: string }) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return updateUser({ ...data, token });
    },
  });
}
