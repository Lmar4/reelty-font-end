import { Suspense } from "react";
import UserStatsSection from "./_components/user-stats-section";
import SystemStatsSection from "./_components/system-stats-section";
import CreditStatsSection from "./_components/credit-stats-section";
import RecentActivitySection from "./_components/recent-activity-section";
import VideoAnalyticsSection from "./_components/video-analytics-section";
import RevenueAnalyticsSection from "./_components/revenue-analytics-section";
import CreditAnalyticsSection from "./_components/credit-analytics-section";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoadingState() {
  return (
    <div className='flex h-[500px] w-full items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin' />
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className='space-y-8 pt-8'>
      <div>
        <h1 className='text-3xl font-bold'>Dashboard Overview</h1>
        <p className='text-muted-foreground'>
          Monitor your application's performance and user activity.
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <div className='grid gap-8'>
          {/* Overview Stats */}
          <div>
            <h2 className='text-2xl font-semibold mb-4'>Quick Stats</h2>
            <div className='grid gap-4'>
              <UserStatsSection />
              <CreditStatsSection />
            </div>
          </div>

          {/* Detailed Analytics */}
          <div>
            <h2 className='text-2xl font-semibold mb-4'>Detailed Analytics</h2>
            <Tabs defaultValue='revenue' className='space-y-4'>
              <TabsList>
                <TabsTrigger value='revenue'>Revenue</TabsTrigger>
                <TabsTrigger value='credits'>Credits</TabsTrigger>
                <TabsTrigger value='videos'>Videos</TabsTrigger>
              </TabsList>
              <TabsContent value='revenue'>
                <RevenueAnalyticsSection />
              </TabsContent>
              <TabsContent value='credits'>
                <CreditAnalyticsSection />
              </TabsContent>
              <TabsContent value='videos'>
                <VideoAnalyticsSection />
              </TabsContent>
            </Tabs>
          </div>

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
      </Suspense>
    </div>
  );
}
