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
import type { CreditAnalytics } from "@/app/admin/types";

interface CreditsSectionProps {
  data?: CreditAnalytics;
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

const calculateAverageDailyUsage = (data?: CreditAnalytics) => {
  if (!data?.dailyCredits?.length) {
    return 0;
  }
  return Math.round(
    data.dailyCredits.reduce((sum, day) => sum + day.amount, 0) /
      data.dailyCredits.length
  );
};

export const CreditsSection: FC<CreditsSectionProps> = ({
  data,
  isLoading,
}) => {
  const averageDailyUsage = calculateAverageDailyUsage(data);

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Credits Used'
          value={data?.totalCredits || 0}
          isLoading={isLoading}
        />
        <StatCard
          title='Top Credit Type'
          value={data?.creditsByType[0]?.type || "N/A"}
          isLoading={isLoading}
          skeletonWidth='w-[120px]'
        />
        <StatCard
          title='Top User Credits'
          value={data?.topUsers[0]?.total || 0}
          isLoading={isLoading}
        />
        <StatCard
          title='Average Daily Usage'
          value={averageDailyUsage}
          isLoading={isLoading}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <ChartCard
          title='Credit Usage Over Time'
          description='Daily credit usage trends'
          isLoading={isLoading}
          className='col-span-4'
        >
          <LineChart
            data={data?.dailyCredits || []}
            xField='date'
            yField='amount'
            categories={["amount"]}
          />
        </ChartCard>
        <ChartCard
          title='Credits by Type'
          description='Distribution of credits across different types'
          isLoading={isLoading}
          className='col-span-3'
        >
          <BarChart
            data={data?.creditsByType || []}
            xField='reason'
            yField='amount'
            categories={["amount"]}
          />
        </ChartCard>
      </div>
    </div>
  );
};
