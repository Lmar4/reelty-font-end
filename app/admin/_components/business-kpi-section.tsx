"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
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
import type { BusinessKPIs } from "../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

interface BusinessKpiSectionProps {
  initialData: BusinessKPIs;
}

export default function BusinessKpiSection({
  initialData,
}: BusinessKpiSectionProps) {
  const { data: kpis = initialData, isLoading } = useQuery({
    queryKey: ["businessKpis"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats/business-kpis");
      if (!response.ok) {
        throw new Error("Failed to fetch business KPIs");
      }
      const data = await response.json();
      return data.data;
    },
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

  if (!kpis) {
    return (
      <div className='space-y-6'>
        <p>No business KPI data available</p>
      </div>
    );
  }

  // Calculate month-over-month changes
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { isUp: true, percentage: 0 };

    const percentageChange = ((current - previous) / previous) * 100;

    return {
      isUp: percentageChange >= 0,
      percentage: Math.abs(Math.round(percentageChange)),
    };
  };

  // Get trends if historical data is available
  const trends = {
    customers: { isUp: true, percentage: 0 },
    newCustomers: { isUp: true, percentage: 0 },
    churn: { isUp: true, percentage: 0 },
    arpa: { isUp: true, percentage: 0 },
  };

  if (kpis.historicalData && kpis.historicalData.length >= 2) {
    const currentMonth = kpis.historicalData[kpis.historicalData.length - 1];
    const previousMonth = kpis.historicalData[kpis.historicalData.length - 2];

    trends.customers = calculateTrend(
      currentMonth.currentCustomers,
      previousMonth.currentCustomers
    );

    trends.newCustomers = calculateTrend(
      currentMonth.newCustomers,
      previousMonth.newCustomers
    );

    trends.churn = calculateTrend(
      currentMonth.churnRate,
      previousMonth.churnRate
    );
    // For churn, lower is better, so invert the isUp value
    trends.churn.isUp = !trends.churn.isUp;

    trends.arpa = calculateTrend(currentMonth.arpa, previousMonth.arpa);
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Business KPIs</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Current Customers
          </h3>
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold'>{kpis.currentCustomers}</p>
            <div
              className={`flex items-center ${
                trends.customers.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {trends.customers.isUp ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}
              <span className='text-sm ml-1'>
                {trends.customers.percentage}%
              </span>
            </div>
          </div>
        </Card>

        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            New Customers Per Month
          </h3>
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold'>{kpis.newCustomersPerMonth}</p>
            <div
              className={`flex items-center ${
                trends.newCustomers.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {trends.newCustomers.isUp ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}
              <span className='text-sm ml-1'>
                {trends.newCustomers.percentage}%
              </span>
            </div>
          </div>
        </Card>

        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Monthly Churn Rate
          </h3>
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold'>
              {formatPercentage(kpis.monthlyChurnRate)}
            </p>
            <div
              className={`flex items-center ${
                trends.churn.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {trends.churn.isUp ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}
              <span className='text-sm ml-1'>{trends.churn.percentage}%</span>
            </div>
          </div>
        </Card>

        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Monthly ARPA
          </h3>
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold'>
              {formatCurrency(kpis.monthlyARPA)}
            </p>
            <div
              className={`flex items-center ${
                trends.arpa.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {trends.arpa.isUp ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}
              <span className='text-sm ml-1'>{trends.arpa.percentage}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Historical Trends */}
      {kpis.historicalData && kpis.historicalData.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Customers Trend */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Customer Growth</h3>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={kpis.historicalData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='currentCustomers'
                    stroke='#8884d8'
                    fill='#8884d8'
                    name='Current Customers'
                  />
                  <Area
                    type='monotone'
                    dataKey='newCustomers'
                    stroke='#82ca9d'
                    fill='#82ca9d'
                    name='New Customers'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Churn and ARPA Trend */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Churn & ARPA</h3>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={kpis.historicalData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis yAxisId='left' orientation='left' />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    domain={[0, "dataMax + 1"]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "churnRate")
                        return `${Number(value).toFixed(2)}%`;
                      return formatCurrency(Number(value));
                    }}
                  />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='arpa'
                    stroke='#8884d8'
                    fill='#8884d8'
                    name='ARPA'
                    yAxisId='left'
                  />
                  <Area
                    type='monotone'
                    dataKey='churnRate'
                    stroke='#ff8042'
                    fill='#ff8042'
                    name='Churn Rate'
                    yAxisId='right'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
