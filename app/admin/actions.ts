"use server";

import { auth } from "@clerk/nextjs/server";

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

export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sessionToken = await getToken();
  if (!sessionToken) {
    throw new Error("No session token available");
  }

  console.log("[REVENUE_ANALYTICS] Making request with token:", sessionToken);
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/analytics/revenue`,
    {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  console.log("[REVENUE_ANALYTICS] Response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("[REVENUE_ANALYTICS] Error response:", errorText);
    throw new Error(`Failed to fetch revenue analytics: ${errorText}`);
  }

  return response.json();
}

export async function getVideoAnalytics(): Promise<VideoAnalytics> {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sessionToken = await getToken();
  if (!sessionToken) {
    throw new Error("No session token available");
  }

  console.log("[VIDEO_ANALYTICS] Making request with token:", sessionToken);
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/analytics/videos`,
    {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  console.log("[VIDEO_ANALYTICS] Response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("[VIDEO_ANALYTICS] Error response:", errorText);
    throw new Error(`Failed to fetch video analytics: ${errorText}`);
  }

  return response.json();
}

export async function getCreditAnalytics(): Promise<CreditAnalytics> {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sessionToken = await getToken();
  if (!sessionToken) {
    throw new Error("No session token available");
  }

  console.log("[CREDIT_ANALYTICS] Making request with token:", sessionToken);
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/analytics/credits`,
    {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  console.log("[CREDIT_ANALYTICS] Response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CREDIT_ANALYTICS] Error response:", errorText);
    throw new Error(`Failed to fetch credit analytics: ${errorText}`);
  }

  return response.json();
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

export async function getRecentActivity(): Promise<Activity[]> {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/analytics/activity`,
    {
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  return response.json();
}
