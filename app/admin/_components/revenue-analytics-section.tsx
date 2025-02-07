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
import { type RevenueAnalytics } from "../actions";

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
  const { data: analytics } = useQuery({
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

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Revenue Analytics</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Monthly Recurring Revenue
          </h3>
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold'>
              {formatCurrency(analytics.currentMRR)}
            </p>
            {analytics.revenueGrowth > 0 ? (
              <TrendingUp className='h-4 w-4 text-green-500' />
            ) : (
              <TrendingDown className='h-4 w-4 text-red-500' />
            )}
          </div>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Annual Recurring Revenue
          </h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(analytics.currentARR)}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Churn Rate
          </h3>
          <p className='text-2xl font-bold'>
            {(analytics.churnRate * 100).toFixed(1)}%
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Upgrades vs Downgrades
          </h3>
          <div className='flex items-center gap-2'>
            <span className='text-green-500'>+{analytics.upgrades}</span>
            <span>/</span>
            <span className='text-red-500'>-{analytics.downgrades}</span>
          </div>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Monthly Revenue Trend</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.monthlyRevenue}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Area
                type='monotone'
                dataKey='revenue'
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
            <BarChart data={analytics.revenueByTier}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='tier' />
              <YAxis yAxisId='left' orientation='left' stroke='#4ade80' />
              <YAxis yAxisId='right' orientation='right' stroke='#60a5fa' />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue")
                    return formatCurrency(value as number);
                  return value;
                }}
              />
              <Legend />
              <Bar
                yAxisId='left'
                dataKey='revenue'
                fill='#4ade80'
                name='Revenue'
              />
              <Bar
                yAxisId='right'
                dataKey='users'
                fill='#60a5fa'
                name='Users'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Subscription Changes */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Subscription Changes</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.monthlyRevenue}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='newSubscriptions'
                stackId='1'
                stroke='#4ade80'
                fill='#4ade80'
                name='New Subscriptions'
              />
              <Area
                type='monotone'
                dataKey='churned'
                stackId='1'
                stroke='#f87171'
                fill='#f87171'
                name='Churned'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
