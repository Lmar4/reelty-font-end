"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminUsers } from "@/hooks/queries/use-admin-users";
import { SubscriptionTier } from "@/constants/subscription-tiers";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, subMonths, format } from "date-fns";

export function LifetimePlanSummary() {
  const searchParams = useSearchParams();
  const isLifetimeOnly = searchParams.get("lifetimeOnly") === "true";

  // Only show this component when lifetime filter is active
  if (!isLifetimeOnly) {
    return null;
  }

  return <LifetimePlanStats />;
}

function LifetimePlanStats() {
  const {
    data: users,
    isLoading,
    isError,
  } = useAdminUsers({
    tier: SubscriptionTier.LIFETIME,
    lifetimeOnly: "true",
  });

  const [stats, setStats] = useState({
    totalSubscribers: 0,
    totalCreditsBalance: 0,
    subscribersWithCurrentMonthCredits: 0,
    subscribersWithLastMonthCredits: 0,
    currentMonth: startOfMonth(new Date()).toISOString(),
    lastMonth: startOfMonth(subMonths(new Date(), 1)).toISOString(),
  });

  useEffect(() => {
    if (!users) return;

    const totalSubscribers = users.length;
    const totalCreditsBalance = users.reduce(
      (sum, user) => sum + user.credits,
      0
    );
    const subscribersWithCurrentMonthCredits = users.filter(
      (user) => user.creditStatus?.receivedCurrentMonth
    ).length;
    const subscribersWithLastMonthCredits = users.filter(
      (user) => user.creditStatus?.receivedLastMonth
    ).length;

    setStats({
      totalSubscribers,
      totalCreditsBalance,
      subscribersWithCurrentMonthCredits,
      subscribersWithLastMonthCredits,
      currentMonth: startOfMonth(new Date()).toISOString(),
      lastMonth: startOfMonth(subMonths(new Date(), 1)).toISOString(),
    });
  }, [users]);

  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  if (isError) {
    return (
      <Card className='bg-red-50 border-red-200'>
        <CardHeader>
          <CardTitle className='text-red-800'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-700'>
            Failed to load lifetime plan statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentMonth = new Date(stats.currentMonth);
  const lastMonth = new Date(stats.lastMonth);

  return (
    <div className='mb-6'>
      <h2 className='text-lg font-semibold mb-3'>Lifetime Plan Statistics</h2>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl'>Total Subscribers</CardTitle>
            <CardDescription>Lifetime plan subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{stats.totalSubscribers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl'>Total Credits</CardTitle>
            <CardDescription>Available listing credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {stats.totalCreditsBalance}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xl'>Current Month</CardTitle>
            <CardDescription>
              {format(currentMonth, "MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {stats.subscribersWithCurrentMonthCredits}
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
              {stats.subscribersWithLastMonthCredits}
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              subscribers received credits
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <div className='mb-6'>
      <h2 className='text-lg font-semibold mb-3'>Lifetime Plan Statistics</h2>
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
    </div>
  );
}
