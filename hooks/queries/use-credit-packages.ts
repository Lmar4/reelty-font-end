import { makeBackendRequest } from "@/utils/withAuth";
import { useBaseQuery } from "./useBaseQuery";

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  credits: number;
}

async function fetchCreditPackages(token: string): Promise<CreditPackage[]> {
  try {
    const tiers = await makeBackendRequest<CreditPackage[]>(
      "/api/subscription/tiers",
      {
        sessionToken: token,
      }
    );
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
  return useBaseQuery<CreditPackage[]>(
    ["creditPackages"],
    (token) => fetchCreditPackages(token),
    {
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      retry: 3,
    }
  );
}
