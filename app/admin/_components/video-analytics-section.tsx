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
import { type VideoAnalytics } from "../actions";

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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Videos Generated
          </h3>
          <p className='text-2xl font-bold'>{analytics.totalVideos}</p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Average Generation Time
          </h3>
          <p className='text-2xl font-bold'>{analytics.avgGenerationTime}s</p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Success Rate
          </h3>
          <p className='text-2xl font-bold'>{analytics.successRate}%</p>
        </Card>
      </div>

      {/* Daily Video Generation */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Daily Video Generation</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.dailyVideos}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='count'
                stroke='#4ade80'
                fill='#4ade80'
                name='Videos'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Generation Time Distribution */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Generation Time Distribution
        </h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.generationTimeDistribution}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='range' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='count' fill='#60a5fa' name='Videos' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Error Distribution */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Error Distribution</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.errorDistribution}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='error' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='count' fill='#f87171' name='Errors' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
