"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FeatureUsage {
  feature: string;
  count: number;
  percentage: number;
}

async function getFeatureUsage(): Promise<FeatureUsage[]> {
  const response = await fetch("/api/admin/stats/features");
  if (!response.ok) {
    throw new Error("Failed to fetch feature usage");
  }
  return response.json();
}

export default function FeatureUsageSection() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["featureUsage"],
    queryFn: getFeatureUsage,
  });

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-bold mb-6'>Feature Usage</h2>
      <div className='h-[400px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={usage}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='feature' />
            <YAxis yAxisId='left' orientation='left' stroke='#8884d8' />
            <YAxis yAxisId='right' orientation='right' stroke='#82ca9d' />
            <Tooltip />
            <Legend />
            <Bar yAxisId='left' dataKey='count' fill='#8884d8' name='Count' />
            <Bar
              yAxisId='right'
              dataKey='percentage'
              fill='#82ca9d'
              name='Percentage'
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
