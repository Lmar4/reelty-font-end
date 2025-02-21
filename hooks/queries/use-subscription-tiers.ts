import { useQuery } from "@tanstack/react-query";
import { makeBackendRequest } from "@/utils/withAuth";
import type { SubscriptionTier } from "@/types/subscription";
import { useAuth } from "@clerk/nextjs";

async function fetchSubscriptionTiers(
  token: string
): Promise<SubscriptionTier[]> {
  return makeBackendRequest<SubscriptionTier[]>("/api/subscription/tiers", {
    sessionToken: token,
  });
}

export function useSubscriptionTiers() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      const token = await getToken();
      return fetchSubscriptionTiers(token || "");
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: Infinity,
  });
}
