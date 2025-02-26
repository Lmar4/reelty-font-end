import {
  User,
  UserRole,
  SubscriptionStatus,
  PlanType,
  SubscriptionTier,
  Listing,
  ListingCredit as PrismaListingCredit,
} from "./prisma-types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string;
  message?: string;
}

export interface ListingCredit
  extends Omit<PrismaListingCredit, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface ListingBasicInfo extends Pick<Listing, "id" | "status"> {}

export interface SubscriptionTierInfo
  extends Omit<SubscriptionTier, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

// Type for User data returned from the API
export interface UserResource
  extends Omit<
    User,
    | "createdAt"
    | "updatedAt"
    | "subscriptionPeriodEnd"
    | "lastLoginAt"
    | "currentTier"
    | "listingCredits"
    | "listings"
  > {
  createdAt: string;
  updatedAt: string;
  subscriptionPeriodEnd: string | null;
  lastLoginAt: string | null;
  currentTier: SubscriptionTierInfo | null;
  listingCredits: ListingCredit[];
  listings: ListingBasicInfo[];
}

// Type guard to check if a UserResource has all required User fields
export function isFullUser(user: UserResource): user is UserResource {
  return (
    "password" in user &&
    "stripeCustomerId" in user &&
    "stripeSubscriptionId" in user &&
    "stripePriceId" in user &&
    "stripeProductId" in user &&
    "subscriptionPeriodEnd" in user &&
    "currentTierId" in user &&
    "lastLoginAt" in user &&
    "createdAt" in user &&
    "updatedAt" in user &&
    "agencyId" in user &&
    "bulkDiscountId" in user
  );
}

// Helper to transform UserResource to partial User
export function toPartialUser(resource: UserResource): Partial<User> {
  return {
    id: resource.id,
    email: resource.email,
    firstName: resource.firstName,
    lastName: resource.lastName,
    role: resource.role,
    subscriptionStatus: resource.subscriptionStatus,
  };
}
