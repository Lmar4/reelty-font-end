"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { User } from "@/types/prisma-types";
import { UserResource, mapUserResource, ApiResponse } from "@/types/api-types";
import { makeBackendRequest } from "@/utils/withAuth";
import { useBaseQuery } from "./useBaseQuery";

const USER_QUERY_KEY = "user";

async function fetchUserData(
  token: string,
  userId: string
): Promise<ApiResponse<Partial<User>>> {
  const response = await makeBackendRequest<ApiResponse<UserResource>>(
    `/api/users/${userId}`,
    {
      sessionToken: token,
    }
  );
  return {
    ...response,
    data: mapUserResource(response.data),
  };
}

type UpdateUserPayload = {
  id: string;
  name: string;
  email: string;
};

async function updateUser(
  data: UpdateUserPayload,
  token: string
): Promise<ApiResponse<User>> {
  return makeBackendRequest<ApiResponse<User>>(`/api/users/${data.id}`, {
    method: "PUT",
    body: data,
    sessionToken: token,
  });
}

export function useUserData() {
  const { userId } = useAuth();

  return useBaseQuery<Partial<User> | undefined>(
    [USER_QUERY_KEY, userId],
    async (token) => {
      if (!userId)
        return Promise.resolve({
          success: true,
          data: undefined,
        });
      return fetchUserData(token, userId);
    },
    {
      enabled: !!userId,
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
    }
  );
}

export function useUpdateUser() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserPayload>({
    mutationFn: async (data) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token available");
      const response = await updateUser(data, token);
      if (!response.success) {
        throw new Error(response.error || "Failed to update user");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, data.id] });
    },
  });
}
