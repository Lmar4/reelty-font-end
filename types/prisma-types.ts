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

export type VideoGenerationStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

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
  name: string;
  description: string;
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  monthlyPrice: number;
  creditExpirationDays: number;
  creditRolloverMonths: number;
  hasWatermark: boolean;
  maxPhotosPerListing: number;
  maxReelDownloads: number | null;
  maxActiveListings: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  users?: User[];
  templates?: Template[];
  assets?: Asset[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tiers: string[];
  order: number;
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
  subscriptionTier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  tier?: SubscriptionTier;
}

export interface ListingCredit {
  id: string;
  userId: string;
  creditsRemaining: number;
  expiryDate: Date;
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
  coordinates: JsonValue;
  status: string;
  photoLimit: number;
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
  processedFilePath: string | null;
  order: number;
  status: string;
  error: string | null;
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
  error: string | null;
  position: number;
  priority: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

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

export interface ProcessedAsset {
  id: string;
  type: string;
  path: string;
  hash: string;
  settings: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
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
