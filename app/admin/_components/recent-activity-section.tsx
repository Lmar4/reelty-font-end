"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { getRecentActivity } from "../actions";
import type { Activity } from "../types";

interface RecentActivitySectionProps {
  initialData?: Activity[];
}

export default function RecentActivitySection({
  initialData = [],
}: RecentActivitySectionProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: getRecentActivity,
    initialData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className='flex justify-center p-4'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className='text-center p-4 text-muted-foreground'>
        No recent activity to display
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities?.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className='font-medium'>{activity.type}</TableCell>
            <TableCell>{activity.description}</TableCell>
            <TableCell>{activity.user?.email}</TableCell>
            <TableCell>
              {format(new Date(activity.createdAt), "MMM d, yyyy HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
