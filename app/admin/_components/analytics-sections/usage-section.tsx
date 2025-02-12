import { type FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "@/components/ui/line-chart";
import { BarChart } from "@/components/ui/bar-chart";
import type { VideoAnalytics } from "@/app/admin/types";

interface UsageSectionProps {
  data?: VideoAnalytics;
  isLoading: boolean;
}

const StatCard: FC<{
  title: string;
  value: string | number;
  isLoading: boolean;
  skeletonWidth?: string;
}> = ({ title, value, isLoading, skeletonWidth = "w-[90px]" }) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className={`h-7 ${skeletonWidth}`} />
      ) : (
        <div className='text-2xl font-bold'>{value}</div>
      )}
    </CardContent>
  </Card>
);

const ChartCard: FC<{
  title: string;
  description: string;
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, isLoading, children, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className='h-[350px] w-full' /> : children}
    </CardContent>
  </Card>
);

export const UsageSection: FC<UsageSectionProps> = ({ data, isLoading }) => {
  const peakHour = data?.timeDistribution.reduce(
    (max: { hour: number; count: number }, current) =>
      current.count > max.count ? current : max,
    { hour: 0, count: 0 }
  ).hour;

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Videos Generated'
          value={data?.processingStats.total || 0}
          isLoading={isLoading}
        />
        <StatCard
          title='Videos in Progress'
          value={data?.processingStats.inProgress || 0}
          isLoading={isLoading}
          skeletonWidth='w-[60px]'
        />
        <StatCard
          title='Failed Videos'
          value={data?.processingStats.failed || 0}
          isLoading={isLoading}
          skeletonWidth='w-[60px]'
        />
        <StatCard
          title='Peak Usage Hour'
          value={`${peakHour || 0}:00`}
          isLoading={isLoading}
          skeletonWidth='w-[60px]'
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <ChartCard
          title='Daily Video Processing'
          description='Number of videos processed per day'
          isLoading={isLoading}
          className='col-span-4'
        >
          <LineChart
            data={data?.dailyJobs || []}
            xField='date'
            yField='total'
            categories={["total", "success", "failed"]}
          />
        </ChartCard>
        <ChartCard
          title='Usage by Hour'
          description='Distribution of video processing by hour'
          isLoading={isLoading}
          className='col-span-3'
        >
          <BarChart
            data={data?.timeDistribution || []}
            xField='hour'
            yField='count'
            categories={["count"]}
          />
        </ChartCard>
      </div>
    </div>
  );
};
