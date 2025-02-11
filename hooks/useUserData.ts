"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { User } from "@/types/prisma-types";

async function getUserData(userId: string, token: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
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
  });

  return query;
}
