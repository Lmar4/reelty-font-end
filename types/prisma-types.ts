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
  id: string;
  email: string;
  name: string;
  subscriptionTier: string;
  fcmToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionTier {
  id: string;
  description: string;
  pricing: number;
  isAdmin: boolean;
  features: any[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sequence: any;
  durations: any;
  musicPath?: string;
  musicVolume?: number;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditLog {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  adminId?: string;
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

export interface Asset {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  type: AssetType;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingCredit {
  id: string;
  userId: string;
  creditsRemaining: number;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  userId: string;
  address: string;
  description?: string;
  status: string;
  photoLimit: number;
  createdAt: Date;
  updatedAt: Date;
  photos?: Photo[];
  videoJobs?: VideoJob[];
}

export interface Photo {
  id: string;
  userId: string;
  listingId: string;
  filePath: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: string;
  template?: string;
  inputFiles?: any;
  outputFile?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  listing?: Listing;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  createdAt: Date;
}

export interface ErrorLog {
  id: string;
  userId?: string;
  error: string;
  stack?: string;
  createdAt: Date;
}

export interface TempUpload {
  id: string;
  userId: string;
  address?: string;
  files: any[];
  createdAt: Date;
  expiresAt: Date;
}
