import { Suspense } from "react";
import { AnalyticsSkeleton } from "@/components/ui/analytics-skeleton";
import {
  UserStats,
  VideoAnalytics,
  RevenueAnalytics,
  CreditAnalytics,
  RecentActivity,
} from "./components/analytics-sections";

export default function AdminPage() {
  return (
    <div className='container mx-auto p-6 space-y-8 pt-16'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

      {/* User Stats Section */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <UserStats />
      </Suspense>

      {/* Video Analytics Section */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <VideoAnalytics />
      </Suspense>

      {/* Revenue Analytics Section */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <RevenueAnalytics />
      </Suspense>

      {/* Credit Analytics Section */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <CreditAnalytics />
      </Suspense>

      {/* Recent Activity Section */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
