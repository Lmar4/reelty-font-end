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
  processingStats: {
    total: number;
    success: number;
    failed: number;
  };
  totalCredits: number;
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
