"use server";

import { auth } from "@clerk/nextjs/server";

export interface RevenueAnalytics {
  currentMRR: number;
  currentARR: number;
  revenueGrowth: number;
  churnRate: number;
  revenueByTier: {
    tier: string;
    amount: number;
  }[];
  monthlyRevenue: {
    date: string;
    amount: number;
  }[];
}

export interface VideoAnalytics {
  totalVideos: number;
  avgGenerationTime: number;
  successRate: number;
  dailyVideos: {
    date: string;
    count: number;
  }[];
  generationTimeDistribution: {
    range: string;
    count: number;
  }[];
  errorDistribution: {
    error: string;
    count: number;
  }[];
}

export interface CreditAnalytics {
  totalCredits: number;
  creditsByType: {
    reason: string;
    amount: number;
  }[];
  dailyCredits: {
    date: string;
    amount: number;
  }[];
  topUsers: {
    userId: string;
    email: string;
    credits: number;
  }[];
}

export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/stats/revenue`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch revenue analytics");
  }

  return response.json();
}

export async function getVideoAnalytics(): Promise<VideoAnalytics> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/stats/videos`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video analytics");
  }

  return response.json();
}

export async function getCreditAnalytics(): Promise<CreditAnalytics> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/admin/stats/credits`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch credit analytics");
  }

  return response.json();
}
