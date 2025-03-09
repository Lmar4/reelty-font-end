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

// Enums
export enum AssetType {
  MUSIC = "MUSIC",
  WATERMARK = "WATERMARK",
  LOTTIE = "LOTTIE"
}

export enum PlanType {
  PAY_AS_YOU_GO = "PAY_AS_YOU_GO",
  MONTHLY = "MONTHLY"
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export enum UserType {
  INDIVIDUAL = "INDIVIDUAL",
  AGENCY = "AGENCY",
  TEAM_MEMBER = "TEAM_MEMBER"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED"
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  INCOMPLETE = "INCOMPLETE",
  INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
  PAST_DUE = "PAST_DUE",
  TRIALING = "TRIALING",
  UNPAID = "UNPAID",
  PAUSED = "PAUSED"
}

export enum VideoGenerationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export enum AgencyRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE"
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED"
}

export enum ResourceType {
  LISTING = "LISTING",
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  DOWNLOAD = "DOWNLOAD"
}

export enum AllocationPeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUAL = "ANNUAL",
  LIFETIME = "LIFETIME"
}

export enum CreditTransactionType {
  PURCHASE = "PURCHASE",
  SUBSCRIPTION = "SUBSCRIPTION",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
  TRANSFER = "TRANSFER",
  EXPIRATION = "EXPIRATION",
  USAGE = "USAGE",
  PROMOTIONAL = "PROMOTIONAL"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  ROLLED_BACK = "ROLLED_BACK"
}

export enum BillingStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}

export enum AdjustmentStatus {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED"
}

export enum WebhookStatus {
  RECEIVED = "RECEIVED",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  IGNORED = "IGNORED"
}

export enum CycleStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  PROCESSING = "PROCESSING"
}

export enum AccessType {
  VIEW = "VIEW",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXPORT = "EXPORT"
}

export enum ReconciliationStatus {
  PENDING = "PENDING",
  RECONCILED = "RECONCILED",
  CONFLICT = "CONFLICT",
  MANUAL_REVIEW = "MANUAL_REVIEW",
  IGNORED = "IGNORED"
}

export enum AdminActionType {
  CREDIT_ADJUSTMENT = "CREDIT_ADJUSTMENT",
  SUBSCRIPTION_CHANGE = "SUBSCRIPTION_CHANGE",
  USER_ROLE_CHANGE = "USER_ROLE_CHANGE",
  FEATURE_TOGGLE = "FEATURE_TOGGLE",
  ACCOUNT_SUSPENSION = "ACCOUNT_SUSPENSION",
  MANUAL_OVERRIDE = "MANUAL_OVERRIDE"
}

export interface User {
  id: string; // Clerk ID
  email: string;
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  role: UserRole;
  type: UserType;
  status: UserStatus;
  timeZone: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Notification settings
  notificationSettings: JsonValue;
  
  // Relations
  subscription?: Subscription | null;
  creditBalance?: CreditBalance | null;
  creditTransactions?: CreditTransaction[];
  resourceAllocations?: ResourceAllocation[];
  agencyMemberships?: AgencyMembership[];
  ownedAgencyMemberships?: AgencyMembership[];
  agencyInvitations?: AgencyInvitation[];
  listings?: Listing[];
  photos?: Photo[];
  videoJobs?: VideoJob[];
  videoGenerationJobs?: VideoGenerationJob[];
  agencyVideoJobs?: VideoGenerationJob[];
  adminActions?: AdminAction[];
  targetUserActions?: AdminAction[];
  searchHistory?: SearchHistory[];
  errorLogs?: ErrorLog[];
  tempUploads?: TempUpload[];
  userConsents?: UserConsent[];
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  billingEmail: string | null;
  autoRenew: boolean;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  tier?: SubscriptionTier;
  usageRecords?: UsageRecord[];
  billingRecords?: BillingRecord[];
}

export interface SubscriptionTier {
  id: string;
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
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  subscriptions?: Subscription[];
  templates?: Template[];
  assets?: Asset[];
  resourceAllocations?: ResourceAllocation[];
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

export interface CreditBalance {
  id: string;
  userId: string;
  total: number;
  available: number;
  pending: number;
  used: number;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  transactions?: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CreditTransactionType;
  source: string;
  reason: string;
  metadata: JsonValue;
  expiresAt: Date | null;
  createdAt: Date;
  
  // Relations
  user?: User;
  relatedTransaction?: CreditTransaction | null;
}

export interface ResourceAllocation {
  id: string;
  userId: string;
  tierId: string;
  resourceType: ResourceType;
  totalAllocation: number;
  usedAllocation: number;
  period: AllocationPeriod;
  periodStart: Date;
  periodEnd: Date | null;
  rollsOver: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  tier?: SubscriptionTier;
}

export interface AgencyMembership {
  id: string;
  userId: string;
  agencyId: string;
  role: AgencyRole;
  status: MembershipStatus;
  invitationId: string | null;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  agency?: User;
  invitation?: AgencyInvitation | null;
}

export interface AgencyInvitation {
  id: string;
  email: string;
  agencyId: string;
  role: AgencyRole;
  status: InvitationStatus;
  expiresAt: Date;
  token: string;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  
  // Relations
  agency?: User;
  membership?: AgencyMembership | null;
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

export interface AdminAction {
  id: string;
  adminId: string;
  userId: string;
  type: AdminActionType;
  reason: string;
  metadata: JsonValue;
  createdAt: Date;
  
  // Relations
  admin?: User;
  targetUser?: User;
}

export interface UserConsent {
  id: string;
  userId: string;
  type: string;
  consentGiven: boolean;
  version: string;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
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

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  resourceType: ResourceType;
  quantity: number;
  recordedAt: Date;
  metadata: JsonValue | null;
  createdAt: Date;
  
  // Relations
  subscription?: Subscription;
}

export interface BillingRecord {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: BillingStatus;
  invoiceId: string | null;
  invoiceUrl: string | null;
  periodStart: Date;
  periodEnd: Date;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  subscription?: Subscription;
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
