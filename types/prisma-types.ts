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

export interface User {
  id: string; // Clerk ID
  email: string;
  firstName: string | null;
  lastName: string | null;
  password: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: Date | null;
  currentTierId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  subscriptionLogs?: SubscriptionLog[];
  creditLogs?: CreditLog[];
  adminCreditLogs?: CreditLog[];
  tierChanges?: TierChange[];
  adminTierChanges?: TierChange[];
  listingCredits?: ListingCredit[];
  listings?: Listing[];
  photos?: Photo[];
  videoJobs?: VideoJob[];
  searchHistory?: SearchHistory[];
  errorLogs?: ErrorLog[];
  tempUploads?: TempUpload[];
  currentTier?: SubscriptionTier | null;
}

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
  coordinates: Record<string, any>;
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
  status: "pending" | "processing" | "completed" | "error";
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
  status: string;
  progress: number;
  template: string | null;
  inputFiles: any | null;
  outputFile: string | null;
  error: string | null;
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
  files: any[];
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

export interface Activity {
  id: string;
  userId: string;
  action: string;
  details: JsonValue;
  createdAt: Date;

  // Relations
  user?: User;
}
