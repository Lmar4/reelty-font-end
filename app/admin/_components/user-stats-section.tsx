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

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByTier: {
    tier: string;
    count: number;
  }[];
  recentActivity: {
    userId: string;
    action: string;
    timestamp: string;
  }[];
}

async function getUserStats(): Promise<UserStats> {
  const response = await fetch("/api/admin/stats/users");
  if (!response.ok) {
    throw new Error("Failed to fetch user stats");
  }
  return response.json();
}

export default function UserStatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
  });

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Users
          </h3>
          <p className='text-2xl font-bold'>{stats.totalUsers}</p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Active Users
          </h3>
          <p className='text-2xl font-bold'>{stats.activeUsers}</p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            New Users (Last 30 Days)
          </h3>
          <p className='text-2xl font-bold'>{stats.newUsers}</p>
        </Card>
      </div>

      <Card className='p-6'>
        <h2 className='text-2xl font-bold mb-6'>Users by Subscription Tier</h2>
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
            {stats.recentActivity.map((activity, index) => (
              <TableRow key={index}>
                <TableCell>{activity.userId}</TableCell>
                <TableCell>{activity.action}</TableCell>
                <TableCell>{activity.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
