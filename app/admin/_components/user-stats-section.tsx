"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UserStats } from "@/app/admin/types";

interface UserStatsSectionProps {
  initialData: UserStats;
}

interface ApiResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    usersByTier: Array<{
      tier: string;
      count: number;
    }>;
  };
}

async function getUserStats(): Promise<UserStats> {
  const response = await fetch("/api/admin/stats/users");
  if (!response.ok) {
    throw new Error("Failed to fetch user stats");
  }
  const apiResponse: ApiResponse = await response.json();

  if (!apiResponse.success || !apiResponse.data) {
    throw new Error("Invalid response format");
  }

  // Transform API response to match UserStats type
  return {
    totalUsers: apiResponse.data.totalUsers || 0,
    activeUsers: apiResponse.data.activeUsers || 0,
    newUsers: 0, // This seems to be missing from the API response
    usersByTier: apiResponse.data.usersByTier || [],
    recentActivity: [], // This seems to be missing from the API response
  };
}

export default function UserStatsSection({
  initialData,
}: UserStatsSectionProps) {
  const { data: stats = initialData, isLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
    initialData,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='space-y-6'>
        <p>No user statistics available</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Users
          </h3>
          <p className='text-2xl font-bold'>{stats.totalUsers || 0}</p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Active Users
          </h3>
          <p className='text-2xl font-bold'>{stats.activeUsers || 0}</p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            New Users (Last 30 Days)
          </h3>
          <p className='text-2xl font-bold'>{stats.newUsers || 0}</p>
        </Card>
      </div>

      {stats.usersByTier && stats.usersByTier.length > 0 && (
        <Card className='p-6'>
          <h2 className='text-2xl font-bold mb-6'>
            Users by Subscription Tier
          </h2>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={stats.usersByTier}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='tier' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='count' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <Card className='p-6'>
          <h2 className='text-2xl font-bold mb-6'>Recent User Activity</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentActivity.map((activity) => (
                <TableRow key={`${activity.userId}-${activity.timestamp}`}>
                  <TableCell>{activity.userId}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
