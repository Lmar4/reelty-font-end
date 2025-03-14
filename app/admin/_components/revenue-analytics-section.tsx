"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type RevenueAnalytics } from "../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

interface RevenueAnalyticsSectionProps {
  initialData: RevenueAnalytics;
}

export default function RevenueAnalyticsSection({
  initialData,
}: RevenueAnalyticsSectionProps) {
  const { data: analytics = initialData } = useQuery({
    queryKey: ["revenueAnalytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats/revenue");
      if (!response.ok) {
        throw new Error("Failed to fetch revenue analytics");
      }
      return response.json();
    },
    initialData,
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate trends from daily revenue
  const calculateTrend = () => {
    if (!analytics?.dailyRevenue || analytics.dailyRevenue.length < 2) {
      return { isUp: true, percentage: 0 };
    }

    const today =
      analytics.dailyRevenue[analytics.dailyRevenue.length - 1]?.amount || 0;
    const yesterday =
      analytics.dailyRevenue[analytics.dailyRevenue.length - 2]?.amount || 0;

    // Handle edge cases to prevent NaN
    if (yesterday === 0 || !yesterday) {
      return today > 0
        ? { isUp: true, percentage: 100 }
        : { isUp: true, percentage: 0 };
    }

    const percentageChange = ((today - yesterday) / yesterday) * 100;

    // Handle NaN or Infinity results
    if (!isFinite(percentageChange)) {
      return { isUp: true, percentage: 0 };
    }

    return {
      isUp: percentageChange >= 0,
      percentage: Math.abs(Math.round(percentageChange)),
    };
  };

  const trend = calculateTrend();

  // Early return with loading state if analytics is undefined
  if (!analytics) {
    return (
      <div className='space-y-6'>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Revenue Analytics</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Revenue
          </h3>
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold'>
              {formatCurrency(analytics.totalRevenue || 0)}
            </p>
            <div
              className={`flex items-center ${
                trend.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.isUp ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}
              <span className='text-sm ml-1'>
                {isFinite(trend.percentage) ? `${trend.percentage}%` : "0%"}
              </span>
            </div>
          </div>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Active Subscriptions
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.subscriptionStats?.active || 0}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Subscribers
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.subscriptionStats?.total || 0}
          </p>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Monthly Revenue Trend</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Area
                type='monotone'
                dataKey='amount'
                stroke='#4ade80'
                fill='#4ade80'
                name='Revenue'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Revenue by Tier */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Revenue by Subscription Tier
        </h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.revenueByTier || []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='tier' />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey='amount' fill='#4ade80' name='Revenue' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Daily Revenue */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Daily Revenue</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.dailyRevenue || []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Area
                type='monotone'
                dataKey='amount'
                stroke='#4ade80'
                fill='#4ade80'
                name='Revenue'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
