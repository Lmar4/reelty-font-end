import { useAuth } from "@/providers/AuthProvider";
import { useQuery, QueryKey, UseQueryOptions } from "@tanstack/react-query";
import { ApiResponse } from "@/types/api-types";

export function useBaseQuery<T>(
  key: QueryKey,
  fetcher: (token: string) => Promise<ApiResponse<T>>,
  options?: Omit<UseQueryOptions<ApiResponse<T>>, "queryKey" | "queryFn">
) {
  const { isReady, cachedToken, getToken } = useAuth();

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      // Use cached token if available, otherwise get a new one
      const token = cachedToken || (await getToken());
      if (!token) throw new Error("No authentication token available");
      const response = await fetcher(token);
      if (!response.success) {
        throw new Error(response.error || "Request failed");
      }
      return response;
    },
    enabled: isReady && !!cachedToken,
    ...options,
  });
}
