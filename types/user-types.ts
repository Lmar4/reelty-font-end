import type { User as PrismaUser } from "./prisma-types";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "past_due"
  | "canceled"
  | "trialing";

export interface User extends Omit<PrismaUser, "subscriptionStatus"> {
  subscriptionStatus: SubscriptionStatus | null;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserSubscriptionInfo {
  status: SubscriptionStatus;
  priceId: string | null;
  productId: string | null;
  periodEnd: Date | null;
}

export interface UserCreditInfo {
  total: number;
  used: number;
  remaining: number;
  history: {
    amount: number;
    reason: string;
    date: Date;
  }[];
}

export interface UserActivityLog {
  type:
    | "listing_created"
    | "video_generated"
    | "subscription_changed"
    | "credit_added"
    | "credit_used";
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
}

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: "pending" | "processing" | "completed" | "failed";
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
