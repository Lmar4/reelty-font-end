import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import CreditAnalyticsSection from "./_components/credit-analytics-section";
import RecentActivitySection from "./_components/recent-activity-section";
import RevenueAnalyticsSection from "./_components/revenue-analytics-section";
import SystemStatsSection from "./_components/system-stats-section";
import VideoAnalyticsSection from "./_components/video-analytics-section";
import {
  getCreditAnalytics,
  getRevenueAnalytics,
  getVideoAnalytics,
} from "./actions";

export default async function AdminPage() {
  // Fetch initial data in parallel
  const [revenueAnalytics, videoAnalytics, creditAnalytics] = await Promise.all(
    [getRevenueAnalytics(), getVideoAnalytics(), getCreditAnalytics()]
  );

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Current MRR
          </h3>
          <p className='text-2xl font-bold'>
            ${revenueAnalytics.currentMRR.toLocaleString()}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Videos
          </h3>
          <p className='text-2xl font-bold'>
            {videoAnalytics.totalVideos.toLocaleString()}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Success Rate
          </h3>
          <p className='text-2xl font-bold'>{videoAnalytics.successRate}%</p>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <Tabs defaultValue='revenue' className='w-full'>
          <TabsList className='w-full justify-start border-b rounded-none px-6'>
            <TabsTrigger value='revenue'>Revenue</TabsTrigger>
            <TabsTrigger value='videos'>Videos</TabsTrigger>
            <TabsTrigger value='credits'>Credits</TabsTrigger>
          </TabsList>
          <div className='p-6'>
            <TabsContent value='revenue'>
              <Suspense fallback={<LoadingState />}>
                <RevenueAnalyticsSection initialData={revenueAnalytics} />
              </Suspense>
            </TabsContent>
            <TabsContent value='videos'>
              <Suspense fallback={<LoadingState />}>
                <VideoAnalyticsSection initialData={videoAnalytics} />
              </Suspense>
            </TabsContent>
            <TabsContent value='credits'>
              <Suspense fallback={<LoadingState />}>
                <CreditAnalyticsSection initialData={creditAnalytics} />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* System Performance */}
      <div>
        <h2 className='text-2xl font-semibold mb-4'>System Performance</h2>
        <SystemStatsSection />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className='text-2xl font-semibold mb-4'>Recent Activity</h2>
        <Card className='p-6'>
          <Suspense fallback={<LoadingState />}>
            <RecentActivitySection />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
