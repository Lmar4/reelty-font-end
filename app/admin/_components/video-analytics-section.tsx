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
import { type VideoAnalytics } from "../types";

interface VideoAnalyticsSectionProps {
  initialData: VideoAnalytics;
}

export default function VideoAnalyticsSection({
  initialData,
}: VideoAnalyticsSectionProps) {
  const { data: analytics } = useQuery({
    queryKey: ["videoAnalytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats/videos");
      if (!response.ok) {
        throw new Error("Failed to fetch video analytics");
      }
      return response.json();
    },
    initialData,
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Video Analytics</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Videos
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.processingStats.total}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Successful
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.processingStats.success}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>Failed</h3>
          <p className='text-2xl font-bold'>
            {analytics.processingStats.failed}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            In Progress
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.processingStats.inProgress}
          </p>
        </Card>
      </div>

      {/* Daily Video Generation */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Daily Video Generation</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.dailyJobs}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='total'
                stroke='#4ade80'
                fill='#4ade80'
                name='Total'
              />
              <Area
                type='monotone'
                dataKey='success'
                stroke='#60a5fa'
                fill='#60a5fa'
                name='Success'
              />
              <Area
                type='monotone'
                dataKey='failed'
                stroke='#f87171'
                fill='#f87171'
                name='Failed'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Time Distribution */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Video Generation Time Distribution
        </h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.timeDistribution}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='hour' tickFormatter={(hour) => `${hour}:00`} />
              <YAxis />
              <Tooltip labelFormatter={(hour) => `${hour}:00`} />
              <Legend />
              <Bar dataKey='count' fill='#60a5fa' name='Videos' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
