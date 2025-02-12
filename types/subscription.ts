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

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "PAST_DUE"
  | "TRIALING"
  | "UNPAID"
  | "INACTIVE";

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  monthlyPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionLog {
  id: string;
  userId: string;
  action: string;
  stripeSubscriptionId: string;
  stripePriceId?: string;
  stripeProductId?: string;
  status: string;
  periodEnd?: Date;
  createdAt: Date;
}

export interface TierChange {
  id: string;
  userId: string;
  oldTier: string;
  newTier: string;
  reason: string;
  adminId?: string;
  createdAt: Date;
}

// Frontend specific types
export interface Subscription {
  id: string;
  plan: string;
  status: Lowercase<SubscriptionStatus> | "free";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  features?: string[];
}

export interface SubscriptionResponse {
  success: boolean;
  data: Subscription;
  error?: string;
}

export interface SubscriptionTiersResponse {
  success: boolean;
  data: SubscriptionTier[];
  error?: string;
}

export interface TierChangeResponse {
  success: boolean;
  data: TierChange;
  error?: string;
}

export interface SubscriptionLogResponse {
  success: boolean;
  data: SubscriptionLog[];
  error?: string;
}
