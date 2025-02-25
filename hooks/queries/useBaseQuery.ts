import { useAuth } from "@/providers/AuthProvider";
import { useQuery, QueryKey, UseQueryOptions } from "@tanstack/react-query";

export function useBaseQuery<T>(
  key: QueryKey,
  fetcher: (token: string) => Promise<T>,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
) {
  const { isReady, cachedToken, getToken } = useAuth();

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      // Use cached token if available, otherwise get a new one
      const token = cachedToken || (await getToken());
      if (!token) throw new Error("No authentication token available");
      return fetcher(token);
    },
    enabled: isReady && !!cachedToken,
    ...options,
  });
}
