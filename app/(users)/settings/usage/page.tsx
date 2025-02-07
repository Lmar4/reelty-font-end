"use client";

import { useUser } from "@clerk/nextjs";

export default function UsageSettings() {
  const { user } = useUser();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Usage Statistics</h1>
        <p className='text-muted-foreground'>
          Monitor your platform usage and resource consumption.
        </p>
      </div>

      <div className='grid gap-6'>
        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Account Overview</h2>
          <p className='text-sm text-gray-600'>
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Credits Usage</h2>
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-gray-600 mb-2'>Available Credits</p>
              {/* Add credits display here */}
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-2'>
                Credits Used This Month
              </p>
              {/* Add monthly usage here */}
            </div>
          </div>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Usage History</h2>
          <div className='space-y-4'>
            {/* Add usage history table or chart here */}
            <p className='text-sm text-gray-600'>No usage history available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
