"use client";

import { useListings } from "@/hooks/queries/use-listings";
import { LoadingState } from "@/components/ui/loading-state";

export default function Usage() {
  const { listings, isLoading, error } = useListings();

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingState size='lg' />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='p-4 bg-red-50 rounded-lg mt-8'>
        <h2 className='text-xl font-semibold text-red-700 mb-2'>
          Error loading usage data
        </h2>
        <p className='text-red-600'>
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );
  }

  const totalListings = listings?.length || 0;
  const maxListings = 1; // This should come from your subscription plan
  const usagePercentage = (totalListings / maxListings) * 100;

  return (
    <div className='max-w-[800px] mx-auto px-4 py-16'>
      <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>Usage</h1>

      <div className='text-[15px] text-[#6B7280] mb-12'>
        Reset monthly or yearly (depending on your plan)
      </div>

      {/* Listings Usage */}
      <div>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-4'>
          Listings
        </h2>
        <div className='relative'>
          {/* Progress Bar Background */}
          <div className='h-2 bg-[#F3F4F6] rounded-full mb-3'>
            {/* Progress Bar Fill */}
            <div
              className='h-full bg-[#0066FF] rounded-full'
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          {/* Usage Count */}
          <div className='text-[15px] text-[#6B7280]'>
            {totalListings} / {maxListings}
          </div>
        </div>
      </div>
    </div>
  );
}
