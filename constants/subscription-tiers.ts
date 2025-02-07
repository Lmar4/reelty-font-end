export const SUBSCRIPTION_TIERS = {
  BASIC: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Basic",
    description: "Essential features for individual users",
    credits: 10,
  },
  PRO: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Pro",
    description: "Advanced features for professionals",
    credits: 50,
  },
  ENTERPRISE: {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Enterprise",
    description: "Full suite of features for large teams",
    credits: 200,
  },
  ADMIN: {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Admin",
    description: "Administrative access",
    credits: -1, // Unlimited
  },
} as const;

export type SubscriptionTierId =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS]["id"];

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

// Helper function to check if a string is a valid tier ID
export const isValidTierId = (id: string): id is SubscriptionTierId => {
  return Object.values(SUBSCRIPTION_TIERS).some((tier) => tier.id === id);
};

// Helper function to get tier details by ID
export const getTierById = (
  id: SubscriptionTierId
): SubscriptionTier | undefined => {
  return Object.values(SUBSCRIPTION_TIERS).find((tier) => tier.id === id);
};

// Helper function to get tier name by ID
export const getTierNameById = (id: SubscriptionTierId): string => {
  return getTierById(id)?.name || "Unknown";
};
