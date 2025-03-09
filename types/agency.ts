import {
  AgencyRole,
  MembershipStatus,
  InvitationStatus,
  UserRole,
} from "./prisma-types";

export interface AgencyMembershipInfo {
  id: string;
  userId: string;
  agencyId: string;
  role: AgencyRole;
  status: MembershipStatus;

  // Enhanced role management
  isLastOwner: boolean;
  canManageCredits: boolean;
  canInviteMembers: boolean;

  // Resource access fields
  accessibleResourceTypes: string[];

  // Member departure handling
  departureHandled: boolean;
  departureNotes: string | null;

  // Resource allocation
  creditAllocation: number;
  resourceAllocations: Record<string, any>;

  // Timestamps
  joinedAt: Date;
  leftAt: Date | null;
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
  createdAt: Date;
  updatedAt: Date;

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
  notificationProductUpdates?: boolean;
  notificationReelsReady?: boolean;
}

export interface CreateAgencyMembershipInput {
  email: string;
  role: AgencyRole;
  canManageCredits?: boolean;
  canInviteMembers?: boolean;
  accessibleResourceTypes?: string[];
  creditAllocation?: number;
}

export interface UpdateAgencyMembershipInput {
  role?: AgencyRole;
  status?: MembershipStatus;
  canManageCredits?: boolean;
  canInviteMembers?: boolean;
  accessibleResourceTypes?: string[];
  creditAllocation?: number;
  departureNotes?: string;
}

export interface CreateAgencyInvitationInput {
  email: string;
  role: AgencyRole;
  expiresInDays?: number;
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

export interface AgencyCreditTransferInput {
  sourceMembershipId: string;
  targetMembershipId: string;
  amount: number;
  reason: string;
}

export interface AgencyCreditTransfer {
  id: string;
  sourceMembershipId: string;
  targetMembershipId: string;
  amount: number;
  reason: string;
  initiatedById: string;
  createdAt: Date;

  // Additional fields for UI
  sourceUserName?: string;
  targetUserName?: string;
  initiatedByName?: string;
}

export interface AgencyRoleHistoryEntry {
  id: string;
  membershipId: string;
  previousRole: AgencyRole;
  newRole: AgencyRole;
  changedById: string;
  reason: string | null;
  createdAt: Date;

  // Additional fields for UI
  userName?: string;
  changedByName?: string;
}

export interface AgencyActivityLogEntry {
  id: string;
  agencyId: string;
  activityType: string;
  performedById: string;
  targetId: string | null;
  details: Record<string, any>;
  createdAt: Date;

  // Additional fields for UI
  performedByName?: string;
  targetName?: string;
}

export interface AgencyUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  agencyName: string;
  role: UserRole;
  creditsBalance: number;
  maxUsers: number;
  currentUsers: number;
  agencyMaxUsers: number;
  totalCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgencyUserStats {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AgencyRole;
  status: MembershipStatus;
  lastActive: Date | null;
  joinedAt: Date;
  resourceUsage: {
    type: string;
    allocated: number;
    used: number;
    remaining: number;
  }[];
}
