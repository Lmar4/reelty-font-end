"use client";

import { Card } from "@/components/ui/card";
import { useListings } from "@/hooks/queries/use-listings";
import { useJobs } from "@/hooks/use-jobs";
import { VideoJob } from "@/types/user-types";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { Building, Calendar, Film } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  isLoading,
}) => (
  <Card className='p-6'>
    <div className='flex items-center gap-4'>
      <div className='bg-primary/10 p-3 rounded-lg'>{icon}</div>
      <div>
        {isLoading ? (
          <div className='space-y-2'>
            <div className='h-8 w-16 bg-gray-200 animate-pulse rounded' />
            <div className='h-4 w-24 bg-gray-200 animate-pulse rounded' />
          </div>
        ) : (
          <>
            <p className='text-2xl font-semibold'>{value}</p>
            <p className='text-sm text-gray-500'>{label}</p>
          </>
        )}
      </div>
    </div>
  </Card>
);

interface VideoHistoryCardProps {
  totalJobs: number;
  completedJobs: number;
  processingJobs: number;
  failedJobs: number;
  isLoading?: boolean;
}

const VideoHistoryCard: React.FC<VideoHistoryCardProps> = ({
  totalJobs,
  completedJobs,
  processingJobs,
  failedJobs,
  isLoading,
}) => (
  <Card className='p-6'>
    <h2 className='text-lg font-semibold mb-4'>Video Generation History</h2>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {[totalJobs, completedJobs, processingJobs, failedJobs].map(
        (value, index) => (
          <div key={index}>
            {isLoading ? (
              <>
                <div className='h-8 w-16 bg-gray-200 animate-pulse rounded mb-2' />
                <div className='h-4 w-24 bg-gray-200 animate-pulse rounded' />
              </>
            ) : (
              <>
                <p className='text-2xl font-semibold'>{value}</p>
                <p className='text-sm text-gray-500'>
                  {index === 0
                    ? "Total Videos"
                    : index === 1
                    ? "Completed"
                    : index === 2
                    ? "Processing"
                    : "Failed"}
                </p>
              </>
            )}
          </div>
        )
      )}
    </div>
  </Card>
);

interface AccountOverviewCardProps {
  email: string;
  createdAt: Date | null;
  daysAsMember: number;
  isLoading?: boolean;
}

const AccountOverviewCard: React.FC<AccountOverviewCardProps> = ({
  email,
  createdAt,
  daysAsMember,
  isLoading,
}) => (
  <Card className='p-6'>
    <h2 className='text-lg font-semibold mb-4'>Account Overview</h2>
    <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
      <div className='text-sm font-medium text-gray-500'>Email</div>
      {isLoading ? (
        <div className='h-4 w-32 bg-gray-200 animate-pulse rounded' />
      ) : (
        <div className='text-sm'>{email}</div>
      )}
      <div className='text-sm font-medium text-gray-500'>Member Since</div>
      {isLoading ? (
        <div className='h-4 w-24 bg-gray-200 animate-pulse rounded' />
      ) : (
        <div className='text-sm'>
          {createdAt ? format(createdAt, "PPP") : "N/A"}
        </div>
      )}
      <div className='text-sm font-medium text-gray-500'>Days as Member</div>
      {isLoading ? (
        <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
      ) : (
        <div className='text-sm'>{daysAsMember} days</div>
      )}
    </div>
  </Card>
);

const calculateDaysAsMember = (createdAt: Date | null): number => {
  if (!createdAt) return 0;
  return Math.floor(
    (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const calculateJobStats = (jobs: VideoJob[] = []) => {
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((job) => job.status === "completed").length;
  const processingJobs = jobs.filter(
    (job) => job.status === "processing"
  ).length;
  const failedJobs = jobs.filter((job) => job.status === "failed").length;

  return {
    totalJobs,
    completedJobs,
    processingJobs,
    failedJobs,
  };
};

export default function UsageSettings() {
  const { user } = useUser();
  const { data: listings, isLoading: isListingsLoading } = useListings(
    user?.id || ""
  );
  const { data: jobs, isLoading: isJobsLoading } = useJobs();

  const isLoading = isListingsLoading || isJobsLoading;

  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  const daysAsMember = calculateDaysAsMember(createdAt);
  const jobStats = calculateJobStats(jobs);
  const totalListings = listings?.length || 0;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Usage Statistics</h1>
        <p className='text-muted-foreground'>
          Monitor your platform usage and resource consumption.
        </p>
      </div>

      <div className='grid gap-6'>
        <AccountOverviewCard
          email={user?.emailAddresses[0]?.emailAddress || ""}
          createdAt={createdAt}
          daysAsMember={daysAsMember}
          isLoading={isLoading}
        />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <StatCard
            icon={<Building className='w-6 h-6 text-primary' />}
            value={totalListings}
            label='Total Listings'
            isLoading={isLoading}
          />
          <StatCard
            icon={<Film className='w-6 h-6 text-primary' />}
            value={jobStats.completedJobs}
            label='Generated Videos'
            isLoading={isLoading}
          />
          <StatCard
            icon={<Calendar className='w-6 h-6 text-primary' />}
            value={daysAsMember}
            label='Days as Member'
            isLoading={isLoading}
          />
        </div>

        <VideoHistoryCard {...jobStats} isLoading={isLoading} />
      </div>
    </div>
  );
}
