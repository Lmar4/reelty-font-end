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
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { getRecentActivity } from "../actions";
import { Activity } from "@/types/analytics";
import React from "react";

interface RecentActivitySectionProps {
  initialData?: Activity[];
}

export default function RecentActivitySection({
  initialData = [],
}: RecentActivitySectionProps) {
  const [expandedActivities, setExpandedActivities] = useState<
    Record<string, boolean>
  >({});

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: getRecentActivity,
    initialData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const toggleExpand = (id: string) => {
    setExpandedActivities((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
          <TableHead className='w-[50px]'></TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities?.map((activity) => {
          const hasFailed =
            activity.type === "video" &&
            activity.description.includes("failed");
          const isExpanded = expandedActivities[activity.id] || false;

          return (
            <React.Fragment key={activity.id}>
              <TableRow
                className={hasFailed ? "bg-red-50 hover:bg-red-100" : ""}
              >
                <TableCell className='w-[50px] p-2'>
                  {hasFailed && (
                    <button
                      onClick={() => toggleExpand(activity.id)}
                      className='p-1 rounded hover:bg-muted'
                      aria-label={
                        isExpanded ? "Collapse details" : "Expand details"
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </button>
                  )}
                </TableCell>
                <TableCell
                  className={`font-medium ${hasFailed ? "text-red-600" : ""}`}
                >
                  {activity.type}
                </TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell>{activity.user?.email}</TableCell>
                <TableCell>
                  {format(new Date(activity.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
              </TableRow>

              {hasFailed && isExpanded && activity.metadata && (
                <TableRow className='bg-red-50'>
                  <TableCell colSpan={5} className='p-4'>
                    <div className='bg-white p-3 rounded border border-red-200'>
                      <h4 className='font-medium mb-2'>Error Details</h4>
                      {activity.metadata.error && (
                        <div className='mb-2'>
                          <span className='font-medium'>Error:</span>{" "}
                          {activity.metadata.error}
                        </div>
                      )}
                      {activity.metadata.jobId && (
                        <div className='mb-2'>
                          <span className='font-medium'>Job ID:</span>{" "}
                          {activity.metadata.jobId}
                        </div>
                      )}
                      {activity.metadata.listingId && (
                        <div className='mb-2'>
                          <span className='font-medium'>Listing ID:</span>{" "}
                          {activity.metadata.listingId}
                        </div>
                      )}
                      {activity.metadata.template && (
                        <div className='mb-2'>
                          <span className='font-medium'>Template:</span>{" "}
                          {activity.metadata.template}
                        </div>
                      )}
                      {activity.metadata.additionalInfo && (
                        <pre className='bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]'>
                          {JSON.stringify(
                            activity.metadata.additionalInfo,
                            null,
                            2
                          )}
                        </pre>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
