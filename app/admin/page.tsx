import { Suspense } from "react";
import { AnalyticsSkeleton } from "@/components/ui/analytics-skeleton";
import UserStatsSection from "./_components/user-stats-section";
import VideoAnalyticsSection from "./_components/video-analytics-section";
import RevenueAnalyticsSection from "./_components/revenue-analytics-section";
import CreditAnalyticsSection from "./_components/credit-analytics-section";
import RecentActivitySection from "./_components/recent-activity-section";
import {
  getVideoAnalytics,
  getRevenueAnalytics,
  getCreditAnalytics,
  getUserStats,
  getRecentActivity,
} from "./actions";

export const dynamic = "force-dynamic";
// Set a reasonable revalidation interval (e.g., 5 minutes)
export const revalidate = 300;

// Custom error component for better error presentation
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
    <div className='flex'>
      <div className='flex-shrink-0'>
        <svg
          className='h-5 w-5 text-red-400'
          viewBox='0 0 20 20'
          fill='currentColor'
        >
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
            clipRule='evenodd'
          />
        </svg>
      </div>
      <div className='ml-3'>
        <h3 className='text-sm font-medium text-red-800'>Error Loading Data</h3>
        <p className='mt-2 text-sm text-red-700'>{message}</p>
      </div>
    </div>
  </div>
);

// Wrapper for data fetching with retry logic
async function fetchWithRetry(
  fetchFn: () => Promise<any>,
  retries = 3,
  delay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      if (i === retries - 1) throw error;
      if (error.message?.includes("Too many requests")) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
}

export default async function AdminPage() {
  try {
    // Fetch critical data first
    const userStatsResult = await fetchWithRetry(() => getUserStats());

    // Fetch remaining data with individual error handling
    const [
      videoAnalyticsResult,
      revenueAnalyticsResult,
      creditAnalyticsResult,
      recentActivityResult,
    ] = await Promise.allSettled([
      fetchWithRetry(() => getVideoAnalytics()),
      fetchWithRetry(() => getRevenueAnalytics()),
      fetchWithRetry(() => getCreditAnalytics()),
      fetchWithRetry(() => getRecentActivity()),
    ]);

    // Extract values safely with type checking
    const videoAnalytics =
      videoAnalyticsResult.status === "fulfilled"
        ? videoAnalyticsResult.value
        : null;
    const revenueAnalytics =
      revenueAnalyticsResult.status === "fulfilled"
        ? revenueAnalyticsResult.value
        : null;
    const creditAnalytics =
      creditAnalyticsResult.status === "fulfilled"
        ? creditAnalyticsResult.value
        : null;
    const recentActivity =
      recentActivityResult.status === "fulfilled"
        ? recentActivityResult.value
        : [];

    return (
      <div className='container mx-auto p-6 space-y-8  pt-4 md:pt-0'>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

        {/* User Stats Section - Critical Data */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          <UserStatsSection initialData={userStatsResult} />
        </Suspense>

        {/* Video Analytics Section */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          {videoAnalytics ? (
            <VideoAnalyticsSection initialData={videoAnalytics} />
          ) : (
            <ErrorDisplay message='Unable to load video analytics' />
          )}
        </Suspense>

        {/* Revenue Analytics Section */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          {revenueAnalytics ? (
            <RevenueAnalyticsSection initialData={revenueAnalytics} />
          ) : (
            <ErrorDisplay message='Unable to load revenue analytics' />
          )}
        </Suspense>

        {/* Credit Analytics Section */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          {creditAnalytics ? (
            <CreditAnalyticsSection initialData={creditAnalytics} />
          ) : (
            <ErrorDisplay message='Unable to load credit analytics' />
          )}
        </Suspense>

        {/* Recent Activity Section */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          <RecentActivitySection initialData={recentActivity} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("[ADMIN_PAGE] Critical error:", error);
    return (
      <div className='container mx-auto p-6'>
        <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
        <ErrorDisplay message='There was an error loading the admin dashboard. Please try again later.' />
      </div>
    );
  }
}
