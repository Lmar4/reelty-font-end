"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCreditAnalytics,
  getRevenueAnalytics,
  getVideoAnalytics,
} from "../actions";
import { formatCurrency } from "@/lib/utils";
import { LineChart } from "@/components/ui/line-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsDashboard() {
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

        <TabsContent value='revenue' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[120px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {formatCurrency(revenueData?.totalRevenue || 0)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[60px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {revenueData?.subscriptionStats.active || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Credits Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[90px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {creditData?.totalCredits || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Video Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[60px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {videoData?.processingStats.total
                      ? Math.round(
                          (videoData.processingStats.success /
                            videoData.processingStats.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>
                  Daily revenue for the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-[350px] w-full' />
                ) : (
                  <LineChart
                    data={revenueData?.dailyRevenue || []}
                    xField='date'
                    yField='amount'
                    categories={["amount"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Revenue by Tier</CardTitle>
                <CardDescription>
                  Distribution of revenue across subscription tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-[350px] w-full' />
                ) : (
                  <BarChart
                    data={revenueData?.revenueByTier || []}
                    xField='tier'
                    yField='amount'
                    categories={["amount"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='usage' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Videos Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[90px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {videoData?.processingStats.total || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Videos in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[60px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {videoData?.processingStats.inProgress || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Failed Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[60px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {videoData?.processingStats.failed || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Peak Usage Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[60px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {videoData?.timeDistribution.reduce(
                      (max, current) =>
                        current.count > max.count ? current : max,
                      { hour: 0, count: 0 }
                    ).hour || 0}
                    :00
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Daily Video Processing</CardTitle>
                <CardDescription>
                  Number of videos processed per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-[350px] w-full' />
                ) : (
                  <LineChart
                    data={videoData?.dailyJobs || []}
                    xField='date'
                    yField='total'
                    categories={["total", "success", "failed"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Usage by Hour</CardTitle>
                <CardDescription>
                  Distribution of video processing by hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-[350px] w-full' />
                ) : (
                  <BarChart
                    data={videoData?.timeDistribution || []}
                    xField='hour'
                    yField='count'
                    categories={["count"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='credits' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Credits Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[90px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {creditData?.totalCredits || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Top Credit Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[120px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {creditData?.creditsByType[0]?.reason || "N/A"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Top User Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[90px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {creditData?.topUsers[0]?.credits || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Average Daily Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-7 w-[90px]' />
                ) : (
                  <div className='text-2xl font-bold'>
                    {creditData?.dailyCredits
                      ? creditData.dailyCredits.reduce(
                          (sum, day) => sum + day.amount,
                          0
                        ) / creditData.dailyCredits.length
                      : 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Credit Usage Over Time</CardTitle>
                <CardDescription>Daily credit usage trends</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-[350px] w-full' />
                ) : (
                  <LineChart
                    data={creditData?.dailyCredits || []}
                    xField='date'
                    yField='amount'
                    categories={["amount"]}
                  />
                )}
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Credits by Type</CardTitle>
                <CardDescription>
                  Distribution of credits across different types
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className='h-[350px] w-full' />
                ) : (
                  <BarChart
                    data={creditData?.creditsByType || []}
                    xField='reason'
                    yField='amount'
                    categories={["amount"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
