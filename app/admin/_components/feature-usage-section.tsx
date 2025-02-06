"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { trpc } from "@/lib/trpc";
import { ColumnDef } from "@tanstack/react-table";
import { addDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface FeatureUsage {
  listingUploads: Array<{
    userId: string;
    _count: number;
  }>;
  searches: Array<{
    userId: string;
    _count: number;
  }>;
}

const photoColumns: ColumnDef<FeatureUsage["listingUploads"][0]>[] = [
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "_count",
    header: "Number of Photos",
  },
];

const searchColumns: ColumnDef<FeatureUsage["searches"][0]>[] = [
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "_count",
    header: "Number of Searches",
  },
];

export default function FeatureUsageSection() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const handleDateChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const { data: featureUsage, isLoading } =
    trpc.adminPanel.getFeatureUsage.useQuery(
      {
        startDate: dateRange.from!,
        endDate: dateRange.to!,
      },
      {
        enabled: !!(dateRange.from && dateRange.to),
      }
    );

  if (isLoading) {
    return <div>Loading feature usage statistics...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-end'>
        <DatePickerWithRange date={dateRange} onDateChange={handleDateChange} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Upload Activity</CardTitle>
          <CardDescription>Photos uploaded per listing</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={photoColumns}
            data={featureUsage?.listingUploads || []}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Activity</CardTitle>
          <CardDescription>Searches performed per user</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={searchColumns}
            data={featureUsage?.searches || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
