"use client";

import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { AdminNav } from "./_components/admin-nav";

const ADMIN_TIER_ID = "550e8400-e29b-41d4-a716-446655440003";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { data: userData, isLoading, isError } = useUserData();

  useEffect(() => {
    // Only redirect if we have a definitive non-admin status
    if (
      !isLoading &&
      !isError &&
      userData &&
      userData.data.currentTierId !== ADMIN_TIER_ID
    ) {
      console.log("Client-side admin check failed:", {
        currentTier: userData.data.currentTierId,
        requiredTier: ADMIN_TIER_ID,
      });
      router.replace("/");
    }
  }, [isError, userData, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <AdminNav />
        <main className='container mx-auto px-4 py-16'>
          <div className='flex items-center justify-center min-h-[calc(100vh-4rem)]'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <AdminNav />
        <main className='container mx-auto px-4 py-16'>
          <div className='flex items-center justify-center min-h-[calc(100vh-4rem)]'>
            <div className='text-destructive'>
              Error loading admin dashboard. Please try again later.
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Only render content if user is confirmed admin
  if (!userData || userData.data.currentTierId !== ADMIN_TIER_ID) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <AdminNav />
      <main className='container mx-auto px-4 py-16'>{children}</main>
    </div>
  );
}
