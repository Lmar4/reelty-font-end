import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_TIERS } from "@/constants/subscription-tiers";
import type { SubscriptionTier } from "@/types/subscription";

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      // For now, we're just returning the static tiers
      // You can modify this to fetch from an API if needed
      return Object.values(SUBSCRIPTION_TIERS);
    },
    // Since this data is static, we can cache it for longer
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
