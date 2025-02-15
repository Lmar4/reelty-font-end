"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  timestamp: string;
}

async function getSystemStats(): Promise<SystemStats[]> {
  const response = await fetch("/api/admin/stats/system");
  if (!response.ok) {
    throw new Error("Failed to fetch system stats");
  }
  return response.json();
}

export default function SystemStatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["systemStats"],
    queryFn: getSystemStats,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-bold mb-6'>System Performance</h2>
      <div className='h-[400px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={stats}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='timestamp' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type='monotone'
              dataKey='cpuUsage'
              stackId='1'
              stroke='#8884d8'
              fill='#8884d8'
              name='CPU Usage'
            />
            <Area
              type='monotone'
              dataKey='memoryUsage'
              stackId='1'
              stroke='#82ca9d'
              fill='#82ca9d'
              name='Memory Usage'
            />
            <Area
              type='monotone'
              dataKey='diskUsage'
              stackId='1'
              stroke='#ffc658'
              fill='#ffc658'
              name='Disk Usage'
            />
            <Area
              type='monotone'
              dataKey='networkUsage'
              stackId='1'
              stroke='#ff7300'
              fill='#ff7300'
              name='Network Usage'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
