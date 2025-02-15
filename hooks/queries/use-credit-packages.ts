import { useQuery } from "@tanstack/react-query";

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  credits: number;
}

async function fetchCreditPackages(): Promise<CreditPackage[]> {
  try {
    const response = await fetch("/api/subscription/tiers");
    if (!response.ok) {
      throw new Error("Failed to fetch credit packages");
    }

    const { data: tiers } = await response.json();

    // Convert subscription tiers to credit packages by extracting credits from features
    return (tiers || []).map((tier: CreditPackage) => {
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
  });
}
