import { makeBackendRequest } from "@/utils/withAuth";
import type { SubscriptionTier } from "@/types/subscription";
import { useBaseQuery } from "./useBaseQuery";

async function fetchSubscriptionTiers(
  token: string
): Promise<SubscriptionTier[]> {
  return makeBackendRequest<SubscriptionTier[]>("/api/subscription/tiers", {
    sessionToken: token,
  });
}

export function useSubscriptionTiers() {
  return useBaseQuery<SubscriptionTier[]>(
    ["subscription-tiers"],
    (token) => fetchSubscriptionTiers(token),
    {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
      gcTime: Infinity,
    }
  );
}
