import { useQuery } from "@tanstack/react-query";

import {
  getCreditAnalytics,
  getRevenueAnalytics,
  getVideoAnalytics,
} from "@/app/admin/actions";

export const useAnalyticsData = () => {
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: getRevenueAnalytics,
  });

  const { data: videoData, isLoading: isLoadingVideo } = useQuery({
    queryKey: ["video-analytics"],
    queryFn: getVideoAnalytics,
  });

  const { data: creditData, isLoading: isLoadingCredit } = useQuery({
    queryKey: ["credit-analytics"],
    queryFn: getCreditAnalytics,
  });

  const isLoading = isLoadingRevenue || isLoadingVideo || isLoadingCredit;

  return {
    revenueData,
    videoData,
    creditData,
    isLoading,
  } as const;
};
