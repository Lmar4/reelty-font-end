import { JobStatus } from "./job-types";
import type { 
  User as PrismaUser, 
  SubscriptionStatus as PrismaSubscriptionStatus,
  UserType,
  UserStatus,
  UserRole,
  CreditTransactionType 
} from "./prisma-types";

// Map Prisma enum to string literals for frontend use
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

// Convert Prisma enum values to frontend string literals
export const mapSubscriptionStatus = (status: PrismaSubscriptionStatus): SubscriptionStatus => {
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
  type?: UserType;
  status?: UserStatus;
  notificationSettings?: Record<string, boolean>;
}

export interface UserSubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  tierId: string;
  tierName?: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  billingEmail: string | null;
  autoRenew: boolean;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
}

export interface UserCreditInfo {
  total: number;
  available: number;
  pending: number;
  used: number;
  lastUpdatedAt: Date;
  transactions: {
    id: string;
    amount: number;
    type: CreditTransactionType;
    source: string;
    reason: string;
    createdAt: Date;
    expiresAt: Date | null;
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
    type: string;
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
  createdAt: Date;
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
