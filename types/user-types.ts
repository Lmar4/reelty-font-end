import { JobStatus } from "./job-types";
import type {
  User as PrismaUser,
  SubscriptionStatus as PrismaSubscriptionStatus,
  UserRole,
  CreditSource,
  AdjustmentType,
  ResourceType,
} from "./prisma-types";

// Map Prisma enum to string literals for frontend use
export type SubscriptionStatus =
  | "active"
  | "paused"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "inactive";

// Convert Prisma enum values to frontend string literals
export const mapSubscriptionStatus = (
  status: PrismaSubscriptionStatus
): SubscriptionStatus => {
  return status.toLowerCase() as SubscriptionStatus;
};

export interface User extends Omit<PrismaUser, "subscription"> {
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionPeriodEnd: Date | null;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  timeZone?: string;
  role?: UserRole;
  notificationProductUpdates?: boolean;
  notificationReelsReady?: boolean;
}

export interface UserSubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  tierId: string;
  tierName?: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  customPriceCents: number | null;
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
}

export interface UserCreditInfo {
  total: number;
  available: number;
  transactions: {
    id: string;
    amount: number;
    balanceAfter: number;
    source: CreditSource;
    reason: string;
    createdAt: Date;
    expiresAt: Date | null;
    expiredAmount: number | null;
    resourceType: ResourceType | null;
    resourceId: string | null;
    isAdjustment: boolean;
    adjustmentType: AdjustmentType | null;
  }[];
}

export interface UserActivityLog {
  type:
    | "listing_created"
    | "video_generated"
    | "subscription_changed"
    | "credit_transaction"
    | "agency_membership_changed"
    | "agency_invitation";
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface UserStats {
  totalListings: number;
  totalVideos: number;
  activeVideos: number;
  creditsUsed: number;
  daysActive: number;
  resourceUsage: {
    type: ResourceType;
    allocated: number;
    used: number;
    remaining: number;
  }[];
}

export interface AgencyMembershipInfo {
  id: string;
  agencyId: string;
  agencyName?: string;
  role: string;
  status: string;
  isLastOwner: boolean;
  canManageCredits: boolean;
  canInviteMembers: boolean;
  accessibleResourceTypes: string[];
  departureHandled: boolean;
  departureNotes: string | null;
  creditAllocation: number;
  resourceAllocations: Record<string, any>;
  joinedAt: Date;
  leftAt: Date | null;
  updatedAt: Date;
}

export interface AgencyInvitationInfo {
  id: string;
  email: string;
  agencyId: string;
  agencyName?: string;
  role: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: JobStatus;
  template: string;
  inputFiles: string[];
  outputFile?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  progress: number;
  completedAt: Date | null;
  position: number;
  priority: number;
  startedAt: Date | null;
  thumbnailUrl: string | null;
}

export interface CreateVideoJobInput {
  listingId: string;
  template: string;
  inputFiles: string[];
}

export interface UpdateVideoJobInput {
  status?: "pending" | "processing" | "completed" | "failed";
  outputFile?: string;
  error?: string;
  progress?: number;
  completedAt?: Date | null;
  startedAt?: Date | null;
  thumbnailUrl?: string | null;
}

export interface GetVideoJobsParams {
  listingId?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface RegenerateVideoInput {
  template?: string;
  inputFiles?: string[];
  isRegeneration?: boolean;
}
