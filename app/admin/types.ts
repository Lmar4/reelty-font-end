export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    amount: number;
  }>;
  subscriptionStats: {
    active: number;
    cancelled: number;
    total: number;
  };
  revenueByTier: Array<{
    tier: string;
    amount: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    amount: number;
  }>;
}

export interface VideoAnalytics {
  processingStats: {
    total: number;
    success: number;
    failed: number;
    inProgress: number;
  };
  dailyJobs: Array<{
    date: string;
    total: number;
    success: number;
    failed: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    count: number;
  }>;
}

export interface CreditAnalytics {
  totalCredits: number;
  creditsByType: Array<{
    type: string;
    total: number;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    email: string;
    total: number;
    count: number;
  }>;
  dailyCredits: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export type ActivityType = "video" | "subscription" | "credit";

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user: {
    email: string;
  };
  createdAt: string;
  metadata?: {
    error?: string;
    jobId?: string;
    listingId?: string;
    template?: string;
    errorType?: string;
    details?: string;
    context?: string;
    systemState?: {
      memory?: {
        rss?: string;
        heapTotal?: string;
        heapUsed?: string;
      };
      activeJobs?: number;
      queuedJobs?: number;
    };
    additionalInfo?: Record<string, any>;
    [key: string]: any;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByTier: Array<{
    tier: string;
    count: number;
  }>;
  recentActivity: Array<{
    userId: string;
    action: string;
    timestamp: string;
    id: string;
  }>;
}

export interface BulkDiscount {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  currentUsers: number;
  maxUsers: number;
  totalUsageCount: number; // Total number of times this discount has been used historically
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyUser {
  id: string;
  agencyName: string;
  email: string;
  agencyCurrentUsers: number;
  agencyMaxUsers: number;
  totalCredits: number;
  createdAt: string;
  updatedAt: string;
  role: "AGENCY" | "AGENCY_USER";
}

// Asset types
export interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  name: string;
  type: string;
  url: string;
}

export interface UpdateAssetInput {
  name?: string;
  type?: string;
  url?: string;
}

// Bulk Discount types
export interface CreateBulkDiscountInput {
  code: string;
  discountPercent: number;
  maxUses: number;
  expiresAt?: string;
}

export interface ApplyBulkDiscountInput {
  code: string;
  userId: string;
}

// Agency types
export interface Agency {
  id: string;
  name: string;
  maxUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgencyInput {
  name: string;
  maxUsers: number;
  ownerEmail: string;
  initialCredits: number;
}

export interface AddAgencyUserInput {
  agencyId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  credits?: number;
}

// Subscription types
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  stripePriceId: string;
  createdAt: string;
  updatedAt: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  thumbnailUrl: string;
  order?: number;
  isActive?: boolean;
}

export interface ReorderTemplatesInput {
  templateIds: string[];
}

export interface BusinessKPIs {
  currentCustomers: number;
  newCustomersPerMonth: number;
  monthlyChurnRate: number;
  monthlyARPA: number;
  historicalData: Array<{
    month: string;
    currentCustomers: number;
    newCustomers: number;
    churnRate: number;
    arpa: number;
  }>;
}
