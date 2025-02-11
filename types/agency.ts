export interface AgencyUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "AGENCY" | "AGENCY_USER";
  agencyId?: string;
  agencyOwnerId?: string;
  agencyName?: string;
  agencyMaxUsers?: number;
  agencyCurrentUsers?: number;
  totalCredits?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgencyStats {
  totalUsers: number;
  activeUsers: number;
  totalCredits: number;
  usedCredits: number;
  videoGenerations: number;
}

export interface CreateAgencyInput {
  name: string;
  ownerEmail: string;
  maxUsers: number;
  initialCredits: number;
}

export interface AddAgencyUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  credits?: number;
}

export interface BulkDiscount {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  maxUsers: number;
  currentUsers: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkDiscountInput {
  name: string;
  description: string;
  discountPercent: number;
  maxUsers: number;
  expiresAt?: Date;
}

export interface AgencyUserStats {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  totalCredits: number;
  usedCredits: number;
  lastActive: Date;
  videoGenerations: number;
}

export interface AgencyAnalytics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalVideoGenerations: number;
  creditsUsedToday: number;
  creditsUsedThisMonth: number;
  totalCreditsUsed: number;
  totalCreditsAvailable: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  creditUsage: {
    date: string;
    used: number;
    total: number;
  }[];
  videoGenerationStats: {
    date: string;
    count: number;
    success: number;
    failed: number;
  }[];
}
