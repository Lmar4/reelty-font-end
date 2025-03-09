"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLifetimePlanStats } from "../actions";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function LifetimePlanStats() {
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getLifetimePlanStats>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getLifetimePlanStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError("Failed to load lifetime plan statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <StatsCardSkeleton />;
  }

  if (error) {
    return (
      <Card className='bg-red-50 border-red-200'>
        <CardHeader>
          <CardTitle className='text-red-800'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-700'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const { summary } = stats;
  const currentMonth = new Date(summary.currentMonth);
  const lastMonth = new Date(summary.lastMonth);

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-xl'>Total Subscribers</CardTitle>
          <CardDescription>Lifetime plan subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{summary.totalSubscribers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-xl'>Total Credits</CardTitle>
          <CardDescription>Available listing credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>
            {summary.totalCreditsBalance}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-xl'>Current Month</CardTitle>
          <CardDescription>{format(currentMonth, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>
            {summary.subscribersWithCurrentMonthCredits}
          </div>
          <p className='text-sm text-muted-foreground mt-1'>
            subscribers received credits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-xl'>Last Month</CardTitle>
          <CardDescription>{format(lastMonth, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>
            {summary.subscribersWithLastMonthCredits}
          </div>
          <p className='text-sm text-muted-foreground mt-1'>
            subscribers received credits
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-6 w-[140px]' />
              <Skeleton className='h-4 w-[100px] mt-1' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-[60px]' />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
