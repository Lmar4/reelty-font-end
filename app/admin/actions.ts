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
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
  CreateBulkDiscountInput,
  ApplyBulkDiscountInput,
  CreateAgencyInput,
  Agency,
  SubscriptionTier,
  Template,
  CreateTemplateInput,
  ReorderTemplatesInput,
  AddAgencyUserInput,
  BusinessKPIs,
} from "./types";
import * as plunk from "@/lib/plunk";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function makeAuthenticatedRequest<T>(
  endpoint: string,
  actionName: string,
  transformResponse?: (data: any) => T,
  options?: RequestInit
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

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`;
    console.log(`[${actionName}] Making request to:`, url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
      ...options,
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
      if (data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    }
  );
}

export async function getAssets(): Promise<Asset[]> {
  return makeAuthenticatedRequest<Asset[]>(
    "/api/admin/assets/assets",
    "GET_ASSETS",
    (data) => {
      if (data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    }
  );
}

export async function createAsset(asset: CreateAssetInput): Promise<Asset> {
  return makeAuthenticatedRequest<Asset>(
    "/api/admin/assets/assets",
    "CREATE_ASSET",
    undefined,
    {
      method: "POST",
      body: JSON.stringify(asset),
    }
  );
}

export async function updateAsset(
  assetId: string,
  asset: UpdateAssetInput
): Promise<Asset> {
  return makeAuthenticatedRequest<Asset>(
    `/api/admin/assets/assets/${assetId}`,
    "UPDATE_ASSET",
    undefined,
    {
      method: "PATCH",
      body: JSON.stringify(asset),
    }
  );
}

export async function deleteAsset(assetId: string): Promise<void> {
  return makeAuthenticatedRequest<void>(
    `/api/admin/assets/assets/${assetId}`,
    "DELETE_ASSET",
    undefined,
    {
      method: "DELETE",
    }
  );
}

export async function getBulkDiscounts(): Promise<BulkDiscount[]> {
  return makeAuthenticatedRequest<BulkDiscount[]>(
    "/api/admin/bulk-discounts",
    "BULK_DISCOUNTS",
    (data) => {
      if (data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    }
  );
}

export async function createBulkDiscount(
  discount: CreateBulkDiscountInput
): Promise<BulkDiscount> {
  return makeAuthenticatedRequest<BulkDiscount>(
    "/api/admin/bulk-discounts",
    "CREATE_BULK_DISCOUNT",
    undefined,
    {
      method: "POST",
      body: JSON.stringify(discount),
    }
  );
}

export async function applyBulkDiscount(
  data: ApplyBulkDiscountInput
): Promise<void> {
  return makeAuthenticatedRequest<void>(
    "/api/admin/bulk-discounts/apply",
    "APPLY_BULK_DISCOUNT",
    undefined,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deactivateBulkDiscount(
  discountId: string
): Promise<void> {
  return makeAuthenticatedRequest<void>(
    `/api/admin/bulk-discounts/${discountId}/deactivate`,
    "DEACTIVATE_BULK_DISCOUNT",
    undefined,
    {
      method: "POST",
    }
  );
}

export async function getAgencies(): Promise<AgencyUser[]> {
  return makeAuthenticatedRequest<AgencyUser[]>(
    "/api/admin/agencies",
    "GET_AGENCIES",
    (data) => {
      if (data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    }
  );
}

export async function createAgency(agency: CreateAgencyInput): Promise<Agency> {
  return makeAuthenticatedRequest<Agency>(
    "/api/admin/agencies",
    "CREATE_AGENCY",
    undefined,
    {
      method: "POST",
      body: JSON.stringify(agency),
    }
  );
}

export async function addAgencyUser(data: AddAgencyUserInput): Promise<void> {
  return makeAuthenticatedRequest<void>(
    "/api/admin/agencies/users",
    "ADD_AGENCY_USER",
    undefined,
    {
      method: "POST",
      body: JSON.stringify(data),
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

export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  return makeAuthenticatedRequest<SubscriptionTier[]>(
    "/api/admin/subscription-tiers",
    "GET_SUBSCRIPTION_TIERS",
    (data) => {
      if (data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    }
  );
}

export async function getTemplates(): Promise<Template[]> {
  return makeAuthenticatedRequest<Template[]>(
    "/api/admin/templates",
    "GET_TEMPLATES",
    (data) => {
      if (data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    }
  );
}

export async function createTemplate(
  template: CreateTemplateInput
): Promise<Template> {
  return makeAuthenticatedRequest<Template>(
    "/api/admin/templates",
    "CREATE_TEMPLATE",
    undefined,
    {
      method: "POST",
      body: JSON.stringify(template),
    }
  );
}

export async function reorderTemplates(
  order: ReorderTemplatesInput
): Promise<void> {
  return makeAuthenticatedRequest<void>(
    "/api/admin/templates/reorder",
    "REORDER_TEMPLATES",
    undefined,
    {
      method: "PUT",
      body: JSON.stringify(order),
    }
  );
}

interface AdminCreditGrantParams {
  userId: string;
  creditsAmount: number;
  reason: string;
  adminId: string;
  adminName: string;
}

export async function grantUserCredits({
  userId,
  creditsAmount,
  reason,
  adminId,
  adminName,
}: AdminCreditGrantParams) {
  try {
    // Call backend API to grant credits
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/credits/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          amount: creditsAmount,
          reason,
          adminId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to grant credits");
    }

    const result = await response.json();

    // Get user details for email
    const userResponse = await fetch(
      `${process.env.BACKEND_API_URL}/api/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
      }
    );

    if (userResponse.ok) {
      const user = await userResponse.json();

      // Check if user has enabled product update notifications
      if (user.notificationProductUpdates) {
        // Send email notification using existing plunk function
        // Since there's no dedicated admin credit grant email, we'll use the credit purchase email
        await plunk.sendCreditPurchaseEmail(
          user.email,
          user.firstName || "there",
          creditsAmount,
          0 // No cost since it's an admin grant
        );

        console.log(`Credit grant email sent to ${user.email}`);
      }
    }

    return { success: true, totalCredits: result.totalCredits };
  } catch (error) {
    console.error("Failed to grant credits:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getBusinessKpis(): Promise<BusinessKPIs> {
  return makeAuthenticatedRequest<BusinessKPIs>(
    "/api/admin/stats/business-kpis",
    "BUSINESS_KPIS"
  );
}
