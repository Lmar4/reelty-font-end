"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export default function UserStatsSection() {
  const { data: userStats, isLoading } = trpc.admin.getUserStats.useQuery();

  if (isLoading) {
    return <div>Loading user statistics...</div>;
  }

  const tierData = userStats?.usersByTier.map((tier) => ({
    name: tier.subscriptionTier,
    users: tier._count,
  }));

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{userStats?.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Today</CardTitle>
            <CardDescription>Users active in last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{userStats?.activeUsersToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active This Month</CardTitle>
            <CardDescription>Users active this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>
              {userStats?.activeUsersThisMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users by Subscription Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-[300px] w-full'>
            <BarChart
              width={800}
              height={300}
              data={tierData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='users' fill='#8884d8' />
            </BarChart>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Tiers Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription Tier</TableHead>
                <TableHead>Number of Users</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userStats?.usersByTier.map((tier) => (
                <TableRow key={tier.subscriptionTier}>
                  <TableCell className='font-medium'>
                    {tier.subscriptionTier}
                  </TableCell>
                  <TableCell>{tier._count}</TableCell>
                  <TableCell>
                    {((tier._count / userStats.totalUsers) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
