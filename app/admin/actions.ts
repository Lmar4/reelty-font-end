"use server";

import { auth } from "@clerk/nextjs/server";
import type {
  RevenueAnalytics,
  VideoAnalytics,
  CreditAnalytics,
  Activity,
  UserStats,
  BulkDiscount,
  AgencyUser,
} from "./types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function makeAuthenticatedRequest<T>(
  endpoint: string,
  actionName: string,
  transformResponse?: (data: any) => T
): Promise<T> {
  console.log(`[${actionName}] Starting request`);

  try {
    const { userId, getToken } = await auth();
    console.log(`[${actionName}] Auth check - User ID:`, userId);

    if (!userId) {
      throw new Error("Unauthorized - No user ID");
    }

    const sessionToken = await getToken();
    console.log(`[${actionName}] Session token exists:`, !!sessionToken);

    if (!sessionToken) {
      throw new Error("Unauthorized - No session token");
    }

    const url = `${process.env.BACKEND_URL}${endpoint}`;
    console.log(`[${actionName}] Making request to:`, url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    console.log(`[${actionName}] Response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${actionName}] Error response:`, errorText);
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const rawData = await response.json();
    console.log(`[${actionName}] Raw response:`, rawData);

    // Check if the response follows the API response structure
    if (
      rawData &&
      typeof rawData === "object" &&
      "success" in rawData &&
      "data" in rawData
    ) {
      const apiResponse = rawData as ApiResponse<T>;
      if (!apiResponse.success) {
        throw new Error("API returned unsuccessful response");
      }
      return transformResponse
        ? transformResponse(apiResponse.data)
        : apiResponse.data;
    }

    // If response doesn't follow the API structure, return as is or transform
    return transformResponse ? transformResponse(rawData) : (rawData as T);
  } catch (error) {
    console.error(`[${actionName}] Error:`, {
      name: error instanceof Error ? error.name : "Unknown Error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  return makeAuthenticatedRequest<RevenueAnalytics>(
    "/api/admin/analytics/revenue",
    "REVENUE_ANALYTICS"
  );
}

export async function getVideoAnalytics(): Promise<VideoAnalytics> {
  return makeAuthenticatedRequest<VideoAnalytics>(
    "/api/admin/analytics/videos",
    "VIDEO_ANALYTICS"
  );
}

export async function getCreditAnalytics(): Promise<CreditAnalytics> {
  return makeAuthenticatedRequest<CreditAnalytics>(
    "/api/admin/analytics/credits",
    "CREDIT_ANALYTICS"
  );
}

export async function getRecentActivity(): Promise<Activity[]> {
  return makeAuthenticatedRequest<Activity[]>(
    "/api/admin/analytics/activity",
    "RECENT_ACTIVITY",
    (data) => {
      // If the response is wrapped in a success/data structure
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      // If the response is a direct array
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    }
  );
}

export async function getUserStats(): Promise<UserStats> {
  return makeAuthenticatedRequest<UserStats>(
    "/api/admin/stats/users",
    "USER_STATS",
    (data) => ({
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      newUsers: 0, // This field is missing from the API
      usersByTier: data.usersByTier,
      recentActivity: [], // This field is missing from the API
    })
  );
}

export async function getBulkDiscounts(): Promise<BulkDiscount[]> {
  return makeAuthenticatedRequest<BulkDiscount[]>(
    "/api/admin/bulk-discounts",
    "BULK_DISCOUNTS",
    (data) => {
      // If the response is wrapped in a success/data structure
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      // If the response is a direct array
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    }
  );
}

export async function getAgencies(): Promise<AgencyUser[]> {
  return makeAuthenticatedRequest<AgencyUser[]>(
    "/api/admin/agencies",
    "AGENCIES",
    (data) => {
      // If the response is wrapped in a success/data structure
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      // If the response is a direct array
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    }
  );
}
