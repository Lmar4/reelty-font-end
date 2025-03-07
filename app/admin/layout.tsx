"use client";

import { useUserData } from "@/hooks/useUserData";
import { redirect } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { AdminNav } from "./_components/admin-nav";

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

  // Check role instead of tier
  if (userData?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Admin Navigation */}
      <AdminNav />

      {/* Main Content */}
      <main className='flex-1 pt-20'>
        <div className='max-w-screen-xl mx-auto px-4 py-6'>{children}</div>
      </main>
    </div>
  );
}
