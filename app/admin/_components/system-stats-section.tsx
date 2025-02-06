"use client";

import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatBytes } from "@/lib/utils";

interface SystemStats {
  totalPhotos: number;
  totalSearches: number;
  errorCount: number;
  uptime: number;
  memoryUsage: {
    heapTotal: number;
    heapUsed: number;
    external: number;
    rss: number;
  };
}

export default function SystemStatsSection() {
  const { data: systemStats, isLoading } = trpc.admin.getSystemStats.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  if (isLoading) {
    return <div>Loading system statistics...</div>;
  }

  const memoryData = [
    {
      name: "Heap Total",
      value: systemStats?.memoryUsage.heapTotal || 0,
    },
    {
      name: "Heap Used",
      value: systemStats?.memoryUsage.heapUsed || 0,
    },
    {
      name: "External",
      value: systemStats?.memoryUsage.external || 0,
    },
    {
      name: "RSS",
      value: systemStats?.memoryUsage.rss || 0,
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Photos</CardTitle>
            <CardDescription>Stored in system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{systemStats?.totalPhotos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Searches</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{systemStats?.totalSearches}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Count</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{systemStats?.errorCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uptime</CardTitle>
            <CardDescription>System uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>
              {Math.floor((systemStats?.uptime || 0) / 3600)}h{" "}
              {Math.floor(((systemStats?.uptime || 0) % 3600) / 60)}m
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
          <CardDescription>Current system memory allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[300px] w-full'>
            <LineChart
              width={800}
              height={300}
              data={memoryData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis tickFormatter={(value) => formatBytes(value)} />
              <Tooltip formatter={(value) => formatBytes(Number(value))} />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#8884d8'
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Heap Total:</span>
              <span>
                {formatBytes(systemStats?.memoryUsage.heapTotal || 0)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Heap Used:</span>
              <span>{formatBytes(systemStats?.memoryUsage.heapUsed || 0)}</span>
            </div>
            <div className='flex justify-between'>
              <span>External:</span>
              <span>{formatBytes(systemStats?.memoryUsage.external || 0)}</span>
            </div>
            <div className='flex justify-between'>
              <span>RSS:</span>
              <span>{formatBytes(systemStats?.memoryUsage.rss || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
