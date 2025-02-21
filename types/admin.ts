export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "ADMIN" | "USER" | "AGENCY" | "AGENCY_USER";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  subscriptionStatus:
    | "ACTIVE"
    | "CANCELED"
    | "INCOMPLETE"
    | "INCOMPLETE_EXPIRED"
    | "PAST_DUE"
    | "TRIALING"
    | "UNPAID"
    | "INACTIVE";
  subscriptionPeriodEnd: string | null;
  currentTierId: string | null;
  lastLoginAt: string | null;
  credits: number;
  createdAt: string;
  updatedAt: string;
  agencyId: string | null;
  agencyOwnerId: string | null;
  agencyName: string | null;
  agencyMaxUsers: number | null;
  agencyCurrentUsers: number;
  bulkDiscountId: string | null;
  currentTier?: {
    id: string;
    name: string;
    description: string;
    stripePriceId: string;
    stripeProductId: string;
    features: string[];
    monthlyPrice: number;
    createdAt: string;
    updatedAt: string;
  };
  subscriptionLogs: any[];
}

export interface UserManageModalProps {
  user: AdminUser | null;
  onClose: () => void;
}
