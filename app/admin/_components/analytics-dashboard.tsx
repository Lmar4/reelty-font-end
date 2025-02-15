"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { RevenueSection } from "./analytics-sections/revenue-section";
import { UsageSection } from "./analytics-sections/usage-section";
import { CreditsSection } from "./analytics-sections/credits-section";

export function AnalyticsDashboard() {
  const { revenueData, videoData, creditData, isLoading } = useAnalyticsData();

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          Analytics Dashboard
        </h2>
        <p className='text-muted-foreground'>
          Overview of your platform's performance and metrics
        </p>
      </div>

      <Tabs defaultValue='revenue' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          <TabsTrigger value='usage'>Usage</TabsTrigger>
          <TabsTrigger value='credits'>Credits</TabsTrigger>
        </TabsList>

        <TabsContent value='revenue'>
          <RevenueSection data={revenueData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value='usage'>
          <UsageSection data={videoData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value='credits'>
          <CreditsSection data={creditData} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
