import type {
  VideoJobMetadata,
  ListingMetadata,
  PhotoMetadata,
  AssetMetadata,
} from "./metadata-types";

// Types to replace Prisma runtime types
export type Decimal = string | number;
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type AssetType = "MUSIC" | "WATERMARK" | "LOTTIE";

export type PlanType = "PAY_AS_YOU_GO" | "MONTHLY";

export type UserRole = "USER" | "ADMIN" | "AGENCY" | "AGENCY_USER";

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "PAST_DUE"
  | "TRIALING"
  | "UNPAID"
  | "INACTIVE";

export enum VideoGenerationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface User {
  id: string; // Clerk ID
  email: string;
  firstName: string | null;
  lastName: string | null;
  password: string;
  role: UserRole;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPeriodEnd: Date | null;
  currentTierId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Notification settings
  notificationReelsReady: boolean;
  notificationProductUpdates: boolean;

  // Agency related fields
  agencyId: string | null;
  agencyOwnerId: string | null;
  agencyName: string | null;
  agencyMaxUsers: number | null;
  agencyCurrentUsers: number;

  // Relations
  agency?: User | null;
  agencyUsers?: User[];
  subscriptionLogs?: SubscriptionLog[];
  subscriptionHistory?: SubscriptionHistory[];
  creditLogs?: CreditLog[];
  adminCreditLogs?: CreditLog[];
  tierChanges?: TierChange[];
  adminTierChanges?: TierChange[];
  listingCredits?: ListingCredit[];
  listings?: Listing[];
  photos?: Photo[];
  videoJobs?: VideoJob[];
  videoGenerationJobs?: VideoGenerationJob[];
  agencyVideoJobs?: VideoGenerationJob[];
  searchHistory?: SearchHistory[];
  errorLogs?: ErrorLog[];
  tempUploads?: TempUpload[];
  currentTier?: SubscriptionTier | null;
  bulkDiscount?: BulkDiscount | null;
}

export interface SubscriptionTier {
  id: string;
  tierId: string;
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
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  users?: User[];
  templates?: Template[];
  assets?: Asset[];
  subscriptionHistory?: SubscriptionHistory[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  key: string;
  tiers: string[];
  order: number;
  sequence: JsonValue;
  durations: JsonValue;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  subscriptionTiers?: SubscriptionTier[];
}

export interface CreditLog {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  adminId: string | null;
  createdAt: Date;

  // Relations
  user?: User;
  admin?: User | null;
}

export interface TierChange {
  id: string;
  userId: string;
  oldTier: string;
  newTier: string;
  reason: string;
  adminId: string | null;
  createdAt: Date;

  // Relations
  user?: User;
  admin?: User | null;
}

export interface Asset {
  id: string;
  name: string;
  description: string | null;
  filePath: string;
  type: AssetType;
  subscriptionTierId: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: AssetMetadata | null;

  // Relations
  subscriptionTier?: SubscriptionTier;
}

export interface ListingCredit {
  id: string;
  userId: string;
  creditsRemaining: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

export interface Listing {
  id: string;
  userId: string;
  address: string;
  description: string | null;
  coordinates: JsonValue | null;
  status: string;
  photoLimit: number;
  metadata: ListingMetadata | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  photos?: Photo[];
  videoJobs?: VideoJob[];
}

export interface Photo {
  id: string;
  userId: string;
  listingId: string;
  filePath: string;
  s3Key: string;
  processedFilePath: string | null;
  order: number;
  status: string;
  error: string | null;
  metadata: PhotoMetadata | null;
  runwayVideoPath: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  listing?: Listing;
}

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: VideoGenerationStatus;
  progress: number;
  template: string | null;
  inputFiles: JsonValue | null;
  outputFile: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  position: number;
  priority: number;
  metadata: VideoJobMetadata | null;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;

  // Relations
  user?: User;
  listing?: Listing;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  createdAt: Date;

  // Relations
  user?: User;
}

export interface ErrorLog {
  id: string;
  userId: string | null;
  error: string;
  stack: string | null;
  createdAt: Date;

  // Relations
  user?: User | null;
}

export interface TempUpload {
  id: string;
  userId: string;
  address: string | null;
  files: JsonValue;
  createdAt: Date;
  expiresAt: Date;

  // Relations
  user?: User;
}

export interface SubscriptionLog {
  id: string;
  userId: string;
  action: string;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  status: string;
  periodEnd: Date | null;
  createdAt: Date;

  // Relations
  user?: User;
}

export interface SubscriptionHistory {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  tierId: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  tier?: SubscriptionTier;
}

export interface BulkDiscount {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  maxUsers: number;
  currentUsers: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  users?: User[];
}

export interface VideoGenerationJob {
  id: string;
  userId: string;
  agencyId: string | null;
  inputFiles: JsonValue;
  template: string;
  status: VideoGenerationStatus;
  position: number;
  priority: number;
  error: string | null;
  result: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;

  // Relations
  user?: User;
  agency?: User | null;
}

export interface ProcessedAsset {
  id: string;
  type: string;
  path: string;
  cacheKey: string;
  hash: string;
  settings: JsonValue | null;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedAsset {
  id: string;
  type: string;
  path: string;
  cacheKey: string;
  metadata: JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface CacheLock {
  id: string;
  key: string;
  owner: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingLock {
  id: string;
  listingId: string;
  jobId: string;
  processId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
