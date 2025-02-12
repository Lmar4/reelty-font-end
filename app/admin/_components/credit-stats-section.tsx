"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface CreditStats {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
}

async function getCreditStats(): Promise<CreditStats> {
  const response = await fetch("/api/admin/stats/credits");
  if (!response.ok) {
    throw new Error("Failed to fetch credit stats");
  }
  return response.json();
}

export default function CreditStatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["creditStats"],
    queryFn: getCreditStats,
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
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <Card className='p-4'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          Total Credits
        </h3>
        <p className='text-2xl font-bold'>{stats.totalCredits}</p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          Used Credits
        </h3>
        <p className='text-2xl font-bold'>{stats.usedCredits}</p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium text-muted-foreground'>
          Remaining Credits
        </h3>
        <p className='text-2xl font-bold'>{stats.remainingCredits}</p>
      </Card>
    </div>
  );
}
