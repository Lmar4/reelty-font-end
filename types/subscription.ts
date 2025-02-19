import type {
  SubscriptionTier as PrismaSubscriptionTier,
  SubscriptionStatus,
} from "./prisma-types";

// Plan Type (matching Prisma schema)
export type PlanType = "PAY_AS_YOU_GO" | "MONTHLY";

// Subscription Tier IDs
export const FREE_TRIAL_TIER = {
  FREE_TRIAL: "550e8400-e29b-41d4-a716-446655440000",
} as const;

export const PAY_AS_YOU_GO_TIERS = {
  ONE_CREDIT: "550e8400-e29b-41d4-a716-446655440001",
  FOUR_CREDITS: "550e8400-e29b-41d4-a716-446655440002",
  TEN_CREDITS: "550e8400-e29b-41d4-a716-446655440003",
} as const;

export const MONTHLY_TIERS = {
  REELTY: "550e8400-e29b-41d4-a716-446655440004",
  REELTY_PRO: "550e8400-e29b-41d4-a716-446655440005",
  REELTY_PRO_PLUS: "550e8400-e29b-41d4-a716-446655440006",
} as const;

export const SPECIAL_TIERS = {
  ADMIN: "550e8400-e29b-41d4-a716-446655440007",
} as const;

// Helper functions for tier validation and type checking
export const isValidTierId = (id: string): id is SubscriptionTierId => {
  return Object.values(SUBSCRIPTION_TIERS).includes(id as SubscriptionTierId);
};

export const getTierNameFromId = (id: SubscriptionTierId): string => {
  const entry = Object.entries(SUBSCRIPTION_TIERS).find(
    ([_, value]) => value === id
  );
  return entry ? entry[0] : "UNKNOWN";
};

export const getTierDisplayName = (id: SubscriptionTierId): string => {
  const mapping: Record<SubscriptionTierId, string> = {
    [FREE_TRIAL_TIER.FREE_TRIAL]: "Free Trial",
    [PAY_AS_YOU_GO_TIERS.ONE_CREDIT]: "1 Credit",
    [PAY_AS_YOU_GO_TIERS.FOUR_CREDITS]: "4 Credits",
    [PAY_AS_YOU_GO_TIERS.TEN_CREDITS]: "10 Credits",
    [MONTHLY_TIERS.REELTY]: "Reelty",
    [MONTHLY_TIERS.REELTY_PRO]: "Reelty Pro",
    [MONTHLY_TIERS.REELTY_PRO_PLUS]: "Reelty Pro+",
    [SPECIAL_TIERS.ADMIN]: "Admin",
  };
  return mapping[id] || "Unknown Tier";
};

export const isMonthlyTier = (id: SubscriptionTierId): boolean => {
  return Object.values(MONTHLY_TIERS).includes(
    id as (typeof MONTHLY_TIERS)[keyof typeof MONTHLY_TIERS]
  );
};

export const isPayAsYouGoTier = (id: SubscriptionTierId): boolean => {
  return Object.values(PAY_AS_YOU_GO_TIERS).includes(
    id as (typeof PAY_AS_YOU_GO_TIERS)[keyof typeof PAY_AS_YOU_GO_TIERS]
  );
};

export const getTierCredits = (id: SubscriptionTierId): number => {
  const mapping: Record<SubscriptionTierId, number> = {
    [FREE_TRIAL_TIER.FREE_TRIAL]: 1,
    [PAY_AS_YOU_GO_TIERS.ONE_CREDIT]: 1,
    [PAY_AS_YOU_GO_TIERS.FOUR_CREDITS]: 4,
    [PAY_AS_YOU_GO_TIERS.TEN_CREDITS]: 10,
    [MONTHLY_TIERS.REELTY]: 1,
    [MONTHLY_TIERS.REELTY_PRO]: 4,
    [MONTHLY_TIERS.REELTY_PRO_PLUS]: 10,
    [SPECIAL_TIERS.ADMIN]: -1, // Unlimited
  };
  return mapping[id] || 0;
};

export const SUBSCRIPTION_TIERS = {
  ...FREE_TRIAL_TIER,
  ...PAY_AS_YOU_GO_TIERS,
  ...MONTHLY_TIERS,
  ...SPECIAL_TIERS,
} as const;

// Type for subscription tier IDs
export type SubscriptionTierId =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

// Type for plan features
export interface PlanFeatures {
  maxPhotosPerListing: number;
  unlimitedDownloads: boolean;
  noWatermark: boolean;
  premiumTemplates: boolean;
  prioritySupport: boolean;
  creditsPerInterval: number;
  maxActiveListings: number;
  savePercentage?: number;
}

// Type for subscription tier
export interface SubscriptionTierInfo {
  id: SubscriptionTierId;
  name: string;
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  monthlyPrice: number;
  planType: PlanType;
  creditsPerInterval: number;
  hasWatermark: boolean;
  maxPhotosPerListing: number;
  maxReelDownloads: number | null;
  maxActiveListings: number;
  premiumTemplatesEnabled: boolean;
  metadata?: Record<string, any>;
}

// Type for subscription state
export interface SubscriptionState {
  id: string;
  tier: {
    id: SubscriptionTierId;
    name: string;
    type: "monthly" | "pay_as_you_go";
  } | null;
  status: Lowercase<SubscriptionStatus> | "none";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

// Type for subscription usage stats
export interface SubscriptionUsageStats {
  creditsUsed: number;
  activeListings: number;
  totalListings: number;
  totalVideosGenerated: number;
  storageUsed: number;
}

// Type for subscription invoice
export interface SubscriptionInvoice {
  id: string;
  created: number;
  amount_paid: number;
  status: string;
  invoice_pdf: string | null;
}

// Type for checkout session response
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string | null;
}

// Tier order mapping for comparison
export const TIER_ORDER: Record<SubscriptionTierId, number> = {
  [SUBSCRIPTION_TIERS.FREE_TRIAL]: 0,
  [SUBSCRIPTION_TIERS.ONE_CREDIT]: 1,
  [SUBSCRIPTION_TIERS.FOUR_CREDITS]: 2,
  [SUBSCRIPTION_TIERS.TEN_CREDITS]: 3,
  [SUBSCRIPTION_TIERS.REELTY]: 4,
  [SUBSCRIPTION_TIERS.REELTY_PRO]: 5,
  [SUBSCRIPTION_TIERS.REELTY_PRO_PLUS]: 6,
  [SUBSCRIPTION_TIERS.ADMIN]: 7,
} as const;

// Use the imported type instead of redefining it
export type SubscriptionTier = PrismaSubscriptionTier;

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
