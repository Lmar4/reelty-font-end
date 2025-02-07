import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@/types/prisma-types";

async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}

async function updateUser(data: {
  id: string;
  name: string;
  email: string;
}): Promise<User> {
  const response = await fetch(`/api/users/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  return response.json();
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
  });
}
