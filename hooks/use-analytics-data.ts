import { useBaseQuery } from "./queries/useBaseQuery";
import type { RevenueAnalytics, VideoAnalytics } from "@/types/analytics";
import type { CreditAnalytics } from "@/app/admin/types";

// Define the fetcher functions that accept a token
const fetchRevenueAnalytics = async (token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/analytics/revenue`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch revenue analytics");
  }

  return response.json();
};

const fetchVideoAnalytics = async (token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/analytics/videos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video analytics");
  }

  return response.json();
};

const fetchCreditAnalytics = async (token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/analytics/credits`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch credit analytics");
  }

  const data = await response.json();

  // Transform creditsByType to match the expected format
  return {
    ...data,
    creditsByType: data.creditsByType.map(
      (item: { reason: string; amount: number }) => ({
        type: item.reason,
        total: item.amount,
        count: 1,
      })
    ),
    topUsers: data.topUsers.map((user: any) => ({
      ...user,
      total: user.credits,
      count: 1,
    })),
    dailyCredits: data.dailyCredits.map((day: any) => ({
      ...day,
      count: 1,
    })),
  };
};

export const useAnalyticsData = () => {
  const { data: revenueData, isLoading: isLoadingRevenue } =
    useBaseQuery<RevenueAnalytics>(
      ["revenue-analytics"],
      fetchRevenueAnalytics
    );

  const { data: videoData, isLoading: isLoadingVideo } =
    useBaseQuery<VideoAnalytics>(["video-analytics"], fetchVideoAnalytics);

  const { data: creditData, isLoading: isLoadingCredit } =
    useBaseQuery<CreditAnalytics>(["credit-analytics"], fetchCreditAnalytics);

  const isLoading = isLoadingRevenue || isLoadingVideo || isLoadingCredit;

  return {
    revenueData,
    videoData,
    creditData,
    isLoading,
  } as const;
};
