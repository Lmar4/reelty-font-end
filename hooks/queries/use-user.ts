"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { User } from "@/types/prisma-types";
import { UserResource, toPartialUser } from "@/types/api-types";
import { makeBackendRequest } from "@/utils/withAuth";

const USER_QUERY_KEY = "user";

async function fetchUserData(
  userId: string,
  token: string
): Promise<Partial<User>> {
  const userResource = await makeBackendRequest<UserResource>(
    `/api/users/${userId}`,
    {
      sessionToken: token,
    }
  );
  return toPartialUser(userResource);
}

type UpdateUserPayload = {
  id: string;
  name: string;
  email: string;
};

async function updateUser(
  data: UpdateUserPayload,
  token: string
): Promise<User> {
  return makeBackendRequest<User>(`/api/users/${data.id}`, {
    method: "PUT",
    body: data,
    sessionToken: token,
  });
}

export function useUserData() {
  const { userId, getToken } = useAuth();

  return useQuery<Partial<User> | undefined>({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return undefined;
      const token = await getToken();
      if (!token) return undefined;
      return fetchUserData(userId, token);
    },
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
  });
}

export function useUpdateUser() {
  const { getToken } = useAuth();

  return useMutation<User, Error, UpdateUserPayload>({
    mutationFn: async (data) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token available");
      return updateUser(data, token);
    },
  });
}
