"use client";

import { useUserData } from "@/hooks/useUserData";
import { redirect } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";

// Admin tier ID constant
const ADMIN_TIER_ID = "550e8400-e29b-41d4-a716-446655440003";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: userData, isLoading, isError, error } = useUserData();

  // Show loading state while checking user data
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingState size='lg' />
      </div>
    );
  }

  // Show error state
  if (isError || error) {
    return (
      <div className='p-4 bg-red-50 rounded-lg mt-8'>
        <h2 className='text-xl font-semibold text-red-700 mb-2'>
          Error loading admin data
        </h2>
        <p className='text-red-600'>
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );
  }

  // Only check role after loading is complete
  if (
    !userData?.data?.currentTierId ||
    userData.data.currentTierId !== ADMIN_TIER_ID
  ) {
    redirect("/dashboard");
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='flex-1 container py-6'>{children}</div>
    </div>
  );
}
