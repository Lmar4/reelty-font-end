import type {
  SubscriptionTier as PrismaSubscriptionTier,
  Subscription as PrismaSubscription,
  SubscriptionStatus,
  BillingStatus,
  ResourceType,
  AllocationType,
  CreditSource,
  AdjustmentType,
} from "./prisma-types";

// Plan Type (matching Prisma schema)
export type PlanType = "PAY_AS_YOU_GO" | "MONTHLY";

// Subscription Tier IDs - Matching backend schema
export const SUBSCRIPTION_TIER_IDS = {
  FREE: "550e8400-e29b-41d4-a716-446655440000",
  REELTY: "550e8400-e29b-41d4-a716-446655440001",
  REELTY_PRO: "550e8400-e29b-41d4-a716-446655440002",
  REELTY_PRO_PLUS: "550e8400-e29b-41d4-a716-446655440003",
} as const;

// For backward compatibility
export const FREE_TRIAL_TIER = {
  FREE_TRIAL: SUBSCRIPTION_TIER_IDS.FREE,
} as const;

export const PAY_AS_YOU_GO_TIERS = {
  ONE_CREDIT: SUBSCRIPTION_TIER_IDS.REELTY,
} as const;

export const MONTHLY_TIERS = {
  REELTY: SUBSCRIPTION_TIER_IDS.REELTY,
  REELTY_PRO: SUBSCRIPTION_TIER_IDS.REELTY_PRO,
  REELTY_PRO_PLUS: SUBSCRIPTION_TIER_IDS.REELTY_PRO_PLUS,
} as const;

export const SPECIAL_TIERS = {} as const;

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
  switch (id) {
    case SUBSCRIPTION_TIER_IDS.FREE:
      return "Free";
    case SUBSCRIPTION_TIER_IDS.REELTY:
      return "Reelty";
    case SUBSCRIPTION_TIER_IDS.REELTY_PRO:
      return "Reelty Pro";
    case SUBSCRIPTION_TIER_IDS.REELTY_PRO_PLUS:
      return "Reelty Pro+";
    default:
      return "Unknown Tier";
  }
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
  switch (id) {
    case SUBSCRIPTION_TIER_IDS.FREE:
      return 0;
    case SUBSCRIPTION_TIER_IDS.REELTY:
      return 1;
    case SUBSCRIPTION_TIER_IDS.REELTY_PRO:
      return 5;
    case SUBSCRIPTION_TIER_IDS.REELTY_PRO_PLUS:
      return 10;
    default:
      return 0;
  }
};

// Combine all tiers for type safety
export const SUBSCRIPTION_TIERS = {
  ...FREE_TRIAL_TIER,
  ...PAY_AS_YOU_GO_TIERS,
  ...MONTHLY_TIERS,
  ...SPECIAL_TIERS,
};

export type SubscriptionTierId =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

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

export interface SubscriptionTierInfo {
  id: SubscriptionTierId;
  name: string;
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  monthlyPriceCents: number;
  planType: PlanType;
  creditsPerInterval: number;
  hasWatermark: boolean;
  maxPhotosPerListing: number;
  maxReelDownloads: number | null;
  maxActiveListings: number;
  premiumTemplatesEnabled: boolean;
  isActive?: boolean;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface SubscriptionState {
  id: string;
  tier: {
    id: SubscriptionTierId;
    name: string;
    type: "monthly" | "pay_as_you_go";
  } | null;
  status: Lowercase<SubscriptionStatus> | "none";
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  pausedAt: string | null;
  scheduledResumeAt: string | null;
  autoRenew: boolean;
  isTrialPeriod: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
}

export interface SubscriptionUsageStats {
  resourceUsage: {
    resourceType: ResourceType;
    totalAllocated: number;
    remaining: number;
    allocationType: AllocationType;
    periodStart: Date;
    periodEnd: Date;
  }[];
  totalListings: number;
  totalVideosGenerated: number;
  storageUsed: number;
}

export interface SubscriptionInvoice {
  id: string;
  created: number;
  amount_paid: number;
  status: string;
  invoice_pdf: string | null;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string | null;
}

export interface SubscriptionPricing {
  id: SubscriptionTierId;
  name: string;
  description: string;
  monthlyPriceCents: number;
  features: PlanFeatures;
  popular?: boolean;
  stripePriceId: string;
  stripeProductId: string;
}

export type SubscriptionTier = PrismaSubscriptionTier;

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  billingCycleId: string;
  resourceType: ResourceType;
  quantity: number;
  isBilled: boolean;
  thresholdCategory?: string;
  thresholdValue?: number;
  partiallyBilled: boolean;
  billedAmount: number;
  resourceId?: string;
  recordedAt: Date;
}

export interface BillingRecord {
  id: string;
  subscriptionId: string;
  amountCents: number;
  currency: string;
  status: BillingStatus;
  invoiceId?: string;
  paymentIntentId?: string;
  billingDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  adjustments?: BillingAdjustment[];
}

export interface BillingAdjustment {
  id: string;
  billingRecordId: string;
  amountCents: number;
  reason: string;
  status: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  tierName?: string;
  status: Lowercase<SubscriptionStatus>;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  customPriceCents?: number | null;
  isGrandfathered: boolean;
  startDate: Date;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  pausedAt: Date | null;
  scheduledResumeAt: Date | null;
  isTrialPeriod: boolean;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  creditsBalance: number;
  creditsPerPeriod: number;
  isAgencySubscription: boolean;
  seatsAllocated: number;
  seatsUsed: number;
  hasWatermark?: boolean;
  premiumTemplatesEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface BillingRecordResponse {
  success: boolean;
  data: BillingRecord[];
  error?: string;
}

export interface UsageRecordResponse {
  success: boolean;
  data: UsageRecord[];
  error?: string;
}

export interface CreditTransactionResponse {
  success: boolean;
  data: CreditTransaction[];
  error?: string;
}

export interface CreditTransaction {
  id: string;
  subscriptionId: string;
  amount: number;
  balanceAfter: number;
  source: CreditSource;
  reason: string;
  expiresAt: Date | null;
  expiredAmount: number | null;
  adminId: string | null;
  resourceType: ResourceType | null;
  resourceId: string | null;
  isAdjustment: boolean;
  adjustmentType: AdjustmentType | null;
  createdAt: Date;
  metadata?: Record<string, any>;
}
