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
  Bar,
  BarChart,
} from "recharts";

interface CreditAnalytics {
  totalCreditsIssued: number;
  totalCreditsUsed: number;
  averageCreditsPerUser: number;
  expiringCredits: number;
  creditUsageByDay: {
    date: string;
    used: number;
    issued: number;
  }[];
  creditsByReason: {
    reason: string;
    count: number;
  }[];
  userSegments: {
    segment: string;
    users: number;
    averageCredits: number;
  }[];
}

async function getCreditAnalytics(): Promise<CreditAnalytics> {
  const response = await fetch("/api/admin/stats/credits");
  if (!response.ok) {
    throw new Error("Failed to fetch credit analytics");
  }
  return response.json();
}

export default function CreditAnalyticsSection() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["creditAnalytics"],
    queryFn: getCreditAnalytics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Credit Usage Analytics</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Credits Issued
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.totalCreditsIssued.toLocaleString()}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Credits Used
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.totalCreditsUsed.toLocaleString()}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Average Credits per User
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.averageCreditsPerUser.toFixed(1)}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Credits Expiring (30 days)
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.expiringCredits.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Credit Usage Trend */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Credit Usage Trend</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.creditUsageByDay}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='used'
                stackId='1'
                stroke='#f87171'
                fill='#f87171'
                name='Credits Used'
              />
              <Area
                type='monotone'
                dataKey='issued'
                stackId='2'
                stroke='#4ade80'
                fill='#4ade80'
                name='Credits Issued'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Credit Usage by Reason */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Credit Usage by Reason</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.creditsByReason}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='reason' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='count' fill='#60a5fa' name='Credits' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* User Segments */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Credit Usage by User Segment
        </h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={analytics.userSegments}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='segment' />
              <YAxis yAxisId='left' orientation='left' stroke='#60a5fa' />
              <YAxis yAxisId='right' orientation='right' stroke='#4ade80' />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId='left'
                dataKey='users'
                fill='#60a5fa'
                name='Number of Users'
              />
              <Bar
                yAxisId='right'
                dataKey='averageCredits'
                fill='#4ade80'
                name='Average Credits'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
