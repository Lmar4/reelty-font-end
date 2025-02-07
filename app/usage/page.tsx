"use client";

import { ProtectedRoute } from "@/components/reelty/ProtectedRoute";
import { useUser } from "@clerk/nextjs";

export default function UsagePage() {
  const { user } = useUser();

  return (
    <ProtectedRoute>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold mb-4'>Usage Statistics</h1>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='space-y-4'>
            <div>
              <h2 className='text-lg font-semibold'>Current Usage</h2>
              <p className='text-gray-600'>
                Account: {user?.emailAddresses[0]?.emailAddress}
              </p>
              {/* TODO: Add usage statistics here */}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
