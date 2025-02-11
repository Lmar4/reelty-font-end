import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { User } from "@/types/prisma-types";

async function fetchUser(
  userId: string,
  getToken: () => Promise<string | null>
): Promise<User> {
  const token = await getToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

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

export function useUser(userId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId, getToken),
    enabled: !!userId,
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
