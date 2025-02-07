import { useQuery } from "@tanstack/react-query";
import type { SubscriptionTier } from "@/types/prisma-types";

export interface CreditPackage extends SubscriptionTier {
  credits: number;
}

async function fetchCreditPackages(): Promise<CreditPackage[]> {
  try {
    const response = await fetch("/api/subscription/tiers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch credit packages");
    }

    const tiers: SubscriptionTier[] = await response.json();

    // Convert subscription tiers to credit packages by extracting credits from features
    return tiers.map((tier) => {
      const creditFeature = tier.features.find(
        (feature) =>
          feature.toLowerCase().includes("credit") ||
          feature.toLowerCase().includes("videos")
      );

      const credits = creditFeature
        ? parseInt(creditFeature.match(/\d+/)?.[0] || "0")
        : 0;

      return {
        ...tier,
        credits,
      };
    });
  } catch (error) {
    console.error("[FETCH_CREDIT_PACKAGES_ERROR]", error);
    throw error;
  }
}

export function useCreditPackages() {
  return useQuery({
    queryKey: ["creditPackages"],
    queryFn: fetchCreditPackages,
  });
}
