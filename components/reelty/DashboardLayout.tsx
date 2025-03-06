"use client";

import { useUserData } from "@/hooks/useUserData";
import { DashboardHeader } from "./DashboardHeader";
import FreeTrial from "./FreeTrial";
import { SubscriptionTier } from "@/constants/subscription-tiers";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: userData, isLoading } = useUserData();

  const isFreeTier = userData?.data?.currentTierId === SubscriptionTier.FREE;
  const showBanner = !isLoading && isFreeTier;

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Free Trial Banner */}
      {showBanner && <FreeTrial />}

      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className='flex-1'>
        <div className='max-w-screen-2xl mx-auto px-4'>{children}</div>
      </main>
    </div>
  );
}
