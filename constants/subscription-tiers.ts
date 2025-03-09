export enum SubscriptionTier {
  FREE = "FREE", // Free tier with limited features
  REELTY = "REELTY", // Basic Reelty plan
  REELTY_PRO = "REELTY_PRO", // Pro plan with advanced features
  REELTY_PRO_PLUS = "REELTY_PRO_PLUS", // Pro+ plan with unlimited features
  LIFETIME = "LIFETIME", // Lifetime plan for beta testers
}

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    tier: SubscriptionTier.FREE,
    name: "Free",
    description: "Basic access with limited features",
    credits: 0,
  },
  REELTY: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    tier: SubscriptionTier.REELTY,
    name: "Reelty",
    description: "Essential features with monthly subscription",
    credits: 1,
  },
  REELTY_PRO: {
    id: "550e8400-e29b-41d4-a716-446655440002",
    tier: SubscriptionTier.REELTY_PRO,
    name: "Reelty Pro",
    description: "Advanced features for professionals",
    credits: 4,
  },
  REELTY_PRO_PLUS: {
    id: "550e8400-e29b-41d4-a716-446655440003",
    tier: SubscriptionTier.REELTY_PRO_PLUS,
    name: "Reelty Pro+",
    description: "Unlimited access with premium features",
    credits: 10,
  },
  LIFETIME: {
    id: "550e8400-e29b-41d4-a716-446655440004",
    tier: SubscriptionTier.LIFETIME,
    name: "Reelty Lifetime",
    description:
      "Lifetime access for beta testers. Limited to first 100 users.",
    credits: 24,
  },
} as const;

export type SubscriptionTierDetails =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

// Helper function to check if a string is a valid tier ID
export const isValidTierId = (
  id: string
): id is SubscriptionTierDetails["id"] => {
  return Object.values(SUBSCRIPTION_TIERS).some((tier) => tier.id === id);
};

// Helper function to get tier details by ID
export const getTierById = (
  id: string
): SubscriptionTierDetails | undefined => {
  return Object.values(SUBSCRIPTION_TIERS).find((tier) => tier.id === id);
};

// Helper function to get tier enum from ID
export const getTierEnumById = (id: string): SubscriptionTier | undefined => {
  return getTierById(id)?.tier;
};

// Helper function to get tier name by ID
export const getTierNameById = (id: string): string => {
  return getTierById(id)?.name || "Unknown";
};
