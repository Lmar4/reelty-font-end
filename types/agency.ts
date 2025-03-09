import { AgencyRole, MembershipStatus, InvitationStatus } from './prisma-types';

export interface AgencyMembershipInfo {
  id: string;
  userId: string;
  agencyId: string;
  role: AgencyRole;
  status: MembershipStatus;
  invitationId: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields for UI
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  agencyName?: string;
}

export interface AgencyInvitationInfo {
  id: string;
  email: string;
  agencyId: string;
  role: AgencyRole;
  status: InvitationStatus;
  expiresAt: Date;
  token: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  
  // Additional fields for UI
  agencyName?: string;
}

export interface AgencyStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  resourceAllocations: {
    type: string;
    allocated: number;
    used: number;
    remaining: number;
  }[];
  videoGenerations: number;
}

export interface CreateAgencyInput {
  name: string;
  ownerEmail: string;
  initialCredits?: number;
  notificationSettings?: Record<string, boolean>;
}

export interface CreateAgencyMembershipInput {
  email: string;
  role: AgencyRole;
  metadata?: Record<string, any>;
}

export interface UpdateAgencyMembershipInput {
  role?: AgencyRole;
  status?: MembershipStatus;
  metadata?: Record<string, any>;
}

export interface CreateAgencyInvitationInput {
  email: string;
  role: AgencyRole;
  expiresInDays?: number;
  metadata?: Record<string, any>;
}

export interface BulkDiscount {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  maxUsers: number;
  currentUsers: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkDiscountInput {
  name: string;
  description: string;
  discountPercent: number;
  maxUsers: number;
  expiresAt?: string;
}

export interface AgencyMemberStats {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: AgencyRole;
  status: MembershipStatus;
  resourceUsage: {
    type: string;
    allocated: number;
    used: number;
    remaining: number;
  }[];
  lastActive: Date | null;
  videoGenerations: number;
  createdAt: Date;
}

export interface AgencyAnalytics {
  dailyActiveMembers: number;
  monthlyActiveMembers: number;
  totalVideoGenerations: number;
  resourceUsageToday: {
    type: string;
    used: number;
  }[];
  resourceUsageThisMonth: {
    type: string;
    used: number;
  }[];
  totalResourceUsage: {
    type: string;
    allocated: number;
    used: number;
    remaining: number;
  }[];
  memberGrowth: {
    date: string;
    count: number;
  }[];
  resourceUsageOverTime: {
    date: string;
    type: string;
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
