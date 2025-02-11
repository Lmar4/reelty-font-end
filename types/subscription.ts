export const SUBSCRIPTION_TIERS = {
  BASIC: "550e8400-e29b-41d4-a716-446655440000",
  PRO: "550e8400-e29b-41d4-a716-446655440001",
  ENTERPRISE: "550e8400-e29b-41d4-a716-446655440002",
  ADMIN: "550e8400-e29b-41d4-a716-446655440003",
} as const;

export type SubscriptionTierId =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

// Renamed from SubscriptionTier to SubscriptionTierInfo to avoid conflicts
export interface SubscriptionTierInfo {
  id: SubscriptionTierId;
  name: string;
  description: string;
  price: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to check if a string is a valid tier ID
export const isValidTierId = (id: string): id is SubscriptionTierId => {
  return Object.values(SUBSCRIPTION_TIERS).includes(id as SubscriptionTierId);
};

// Helper function to get tier name from ID
export const getTierNameFromId = (id: SubscriptionTierId): string => {
  const entry = Object.entries(SUBSCRIPTION_TIERS).find(
    ([_, value]) => value === id
  );
  return entry ? entry[0] : "UNKNOWN";
};

// Helper function to get display name
export const getTierDisplayName = (id: SubscriptionTierId): string => {
  const name = getTierNameFromId(id);
  return name.charAt(0) + name.slice(1).toLowerCase();
};

// Tier order mapping for comparison
export const TIER_ORDER: Record<SubscriptionTierId, number> = {
  [SUBSCRIPTION_TIERS.BASIC]: 0,
  [SUBSCRIPTION_TIERS.PRO]: 1,
  [SUBSCRIPTION_TIERS.ENTERPRISE]: 2,
  [SUBSCRIPTION_TIERS.ADMIN]: 3,
} as const;
