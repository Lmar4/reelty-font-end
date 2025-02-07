"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { User } from "@/types/prisma-types";

async function getUserData(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}

export function useUserData() {
  const { userId } = useAuth();
  
  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserData(userId!),
    enabled: !!userId,
  });

  return query;
}
