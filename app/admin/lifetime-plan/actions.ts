"use server";

import { makeBackendRequest } from "@/utils/withAuth";

export interface LifetimePlanStats {
  summary: {
    totalSubscribers: number;
    totalCreditsBalance: number;
    subscribersWithCurrentMonthCredits: number;
    subscribersWithLastMonthCredits: number;
    currentMonth: string;
    lastMonth: string;
  };
  subscribers: LifetimePlanSubscriber[];
}

export interface LifetimePlanSubscriber {
  id: string;
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  creditsBalance: number;
  currentMonthCredits: number;
  lastMonthCredits: number;
  receivedCurrentMonth: boolean;
  receivedLastMonth: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getLifetimePlanStats(): Promise<LifetimePlanStats> {
  try {
    const response = await makeBackendRequest<ApiResponse<LifetimePlanStats>>(
      "/api/admin/lifetime-plan/stats",
      {
        method: "GET",
      }
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch lifetime plan stats");
    }

    return response.data;
  } catch (error) {
    console.error(
      "[LIFETIME_PLAN_ACTIONS] Error fetching lifetime plan stats:",
      error
    );
    throw error;
  }
}
