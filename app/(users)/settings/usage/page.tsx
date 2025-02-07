"use client";

import { useUser } from "@clerk/nextjs";
import { useListings } from "@/hooks/queries/use-listings";
import { useJobs } from "@/hooks/use-jobs";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { format } from "date-fns";
import { Building, Film, Calendar } from "lucide-react";

export default function UsageSettings() {
  const { user } = useUser();
  const { data: listings, isLoading: isListingsLoading } = useListings(
    user?.id || ""
  );
  const { data: jobs, isLoading: isJobsLoading } = useJobs();

  const isLoading = isListingsLoading || isJobsLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  // Calculate statistics
  const totalListings = listings?.length || 0;
  const totalJobs = jobs?.length || 0;
  const completedJobs =
    jobs?.filter((job) => job.status === "completed").length || 0;
  const failedJobs = jobs?.filter((job) => job.status === "failed").length || 0;
  const daysAsMember = user?.createdAt
    ? Math.floor(
        (new Date().getTime() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Usage Statistics</h1>
        <p className='text-muted-foreground'>
          Monitor your platform usage and resource consumption.
        </p>
      </div>

      <div className='grid gap-6'>
        {/* Account Overview */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Account Overview</h2>
          <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
            <div className='text-sm font-medium text-gray-500'>Email</div>
            <div className='text-sm'>
              {user?.emailAddresses[0]?.emailAddress}
            </div>
            <div className='text-sm font-medium text-gray-500'>
              Member Since
            </div>
            <div className='text-sm'>
              {user?.createdAt
                ? format(new Date(user.createdAt), "PPP")
                : "N/A"}
            </div>
            <div className='text-sm font-medium text-gray-500'>
              Days as Member
            </div>
            <div className='text-sm'>{daysAsMember} days</div>
          </div>
        </Card>

        {/* Usage Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-primary/10 p-3 rounded-lg'>
                <Building className='w-6 h-6 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-semibold'>{totalListings}</p>
                <p className='text-sm text-gray-500'>Total Listings</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-primary/10 p-3 rounded-lg'>
                <Film className='w-6 h-6 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-semibold'>{completedJobs}</p>
                <p className='text-sm text-gray-500'>Generated Videos</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-primary/10 p-3 rounded-lg'>
                <Calendar className='w-6 h-6 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-semibold'>{daysAsMember}</p>
                <p className='text-sm text-gray-500'>Days as Member</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Video Generation History */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>
            Video Generation History
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <p className='text-2xl font-semibold'>{totalJobs}</p>
              <p className='text-sm text-gray-500'>Total Videos</p>
            </div>
            <div>
              <p className='text-2xl font-semibold'>{completedJobs}</p>
              <p className='text-sm text-gray-500'>Completed</p>
            </div>
            <div>
              <p className='text-2xl font-semibold'>
                {jobs?.filter((job) => job.status === "processing").length || 0}
              </p>
              <p className='text-sm text-gray-500'>Processing</p>
            </div>
            <div>
              <p className='text-2xl font-semibold'>{failedJobs}</p>
              <p className='text-sm text-gray-500'>Failed</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
