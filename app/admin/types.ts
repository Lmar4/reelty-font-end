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
    reason: string;
    amount: number;
  }>;
  topUsers: Array<{
    userId: string;
    email: string;
    credits: number;
  }>;
  dailyCredits: Array<{
    date: string;
    amount: number;
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
