"use client";

import { useListings } from "@/hooks/queries/use-listings";
import { useJobs } from "@/hooks/use-jobs";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Building, Film, Calendar } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
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
  const completedJobs =
    jobs?.filter((job) => job.status === "completed").length || 0;
  const daysAsMember = user?.createdAt
    ? Math.floor(
        (new Date().getTime() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-[32px] font-semibold text-[#1c1c1c]'>Dashboard</h1>
        <p className='text-[#1c1c1c]/60'>Welcome back, {user?.firstName}!</p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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

      {/* Quick Actions */}
      <div className='grid gap-6'>
        <Link
          href='/dashboard/listings'
          className='block p-6 bg-black text-white rounded-xl hover:bg-black/90 transition-colors'
        >
          <h2 className='text-xl font-semibold mb-2'>Listings</h2>
          <p className='text-white/60'>
            View and manage your real estate listings
          </p>
        </Link>
      </div>
    </div>
  );
}
