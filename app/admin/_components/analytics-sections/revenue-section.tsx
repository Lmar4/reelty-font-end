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
import { formatCurrency } from "@/lib/utils";
import type { RevenueAnalytics } from "@/app/admin/types";

interface RevenueSectionProps {
  data?: RevenueAnalytics;
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

export const RevenueSection: FC<RevenueSectionProps> = ({
  data,
  isLoading,
}) => {
  const currentMonthRevenue =
    data?.monthlyRevenue?.[data.monthlyRevenue.length - 1]?.amount || 0;

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          title='Total Revenue'
          value={formatCurrency(data?.totalRevenue || 0)}
          isLoading={isLoading}
          skeletonWidth='w-[120px]'
        />
        <StatCard
          title='Active Subscriptions'
          value={data?.subscriptionStats.active || 0}
          isLoading={isLoading}
          skeletonWidth='w-[60px]'
        />
        <StatCard
          title='Monthly Revenue'
          value={formatCurrency(currentMonthRevenue)}
          isLoading={isLoading}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the past month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-[350px] w-full' />
            ) : (
              <LineChart
                data={data?.dailyRevenue || []}
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
                data={data?.revenueByTier || []}
                xField='tier'
                yField='amount'
                categories={["amount"]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
