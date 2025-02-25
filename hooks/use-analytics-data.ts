import { useBaseQuery } from "./queries/useBaseQuery";

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

  return response.json();
};

export const useAnalyticsData = () => {
  const { data: revenueData, isLoading: isLoadingRevenue } = useBaseQuery(
    ["revenue-analytics"],
    fetchRevenueAnalytics
  );

  const { data: videoData, isLoading: isLoadingVideo } = useBaseQuery(
    ["video-analytics"],
    fetchVideoAnalytics
  );

  const { data: creditData, isLoading: isLoadingCredit } = useBaseQuery(
    ["credit-analytics"],
    fetchCreditAnalytics
  );

  const isLoading = isLoadingRevenue || isLoadingVideo || isLoadingCredit;

  return {
    revenueData,
    videoData,
    creditData,
    isLoading,
  } as const;
};
