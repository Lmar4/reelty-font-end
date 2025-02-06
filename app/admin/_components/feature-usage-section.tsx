"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { trpc } from "@/lib/trpc";
import { DateRange } from "react-day-picker";

interface FeatureUsage {
  photoUploads: Array<{
    listingId: string;
    _count: number;
  }>;
  searches: Array<{
    userId: string;
    _count: number;
  }>;
}

const photoColumns: ColumnDef<FeatureUsage["photoUploads"][0]>[] = [
  {
    accessorKey: "listingId",
    header: "Listing ID",
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

  const { data: featureUsage, isLoading } = trpc.admin.getFeatureUsage.useQuery(
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
            data={featureUsage?.photoUploads || []}
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
