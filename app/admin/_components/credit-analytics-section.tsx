"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { type CreditAnalytics } from "../types";

interface CreditAnalyticsSectionProps {
  initialData: CreditAnalytics;
}

export default function CreditAnalyticsSection({
  initialData,
}: CreditAnalyticsSectionProps) {
  const { data: analytics } = useQuery({
    queryKey: ["creditAnalytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/credits");
      if (!response.ok) {
        throw new Error("Failed to fetch credit analytics");
      }
      return response.json();
    },
    initialData,
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Credit Analytics</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Credits Used
          </h3>
          <p className='text-2xl font-bold'>{analytics.totalCredits}</p>
        </Card>
      </div>

      {/* Credits by Type */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Credits by Type</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.creditsByType}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='reason' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='amount' fill='#4ade80' name='Credits' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Daily Credit Usage */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Daily Credit Usage</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.dailyCredits}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='amount'
                stroke='#4ade80'
                fill='#4ade80'
                name='Credits'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Users */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Top Credit Users</h3>
        <div className='space-y-4'>
          {analytics.topUsers.map(
            (user: { id: string; email: string; credits: number }) => (
              <div
                key={user.id}
                className='flex items-center justify-between p-2 bg-muted rounded-lg'
              >
                <span className='text-sm font-medium'>{user.email}</span>
                <span className='text-sm'>{user.credits} credits</span>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
