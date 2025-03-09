"use client";

import { useBaseQuery } from "./useBaseQuery";
import { AdminUser } from "@/types/admin";
import { ApiResponse } from "@/types/api-types";
import { unwrapQueryResult } from "@/utils/unwrapApiResponse";

const ADMIN_USERS_QUERY_KEY = "admin-users";

interface AdminUsersFilters {
  tier?: string;
  status?: string;
  minCredits?: string;
  maxCredits?: string;
  search?: string;
}

export function useAdminUsers(filters?: AdminUsersFilters) {
  // Create a query string from the filters
  const queryParams = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        queryParams.set(key, value);
      }
    });
  }

  const queryString = queryParams.toString();

  const query = useBaseQuery<AdminUser[]>(
    [ADMIN_USERS_QUERY_KEY, queryString],
    async (token) => {
      const url = `/api/admin/users${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to fetch users");
      }

      const data = await response.json();
      return data as ApiResponse<AdminUser[]>;
    }
  );

  return unwrapQueryResult(query);
}
