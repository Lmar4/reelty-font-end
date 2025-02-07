import type { SubscriptionTierId } from "@/constants/subscription-tiers";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTierId;
  credits: number;
  status: "active" | "suspended" | "inactive";
  lastActive: string;
  createdAt: string;
}

export interface UserManageModalProps {
  user: AdminUser | null;
  onClose: () => void;
}
