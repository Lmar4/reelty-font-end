"use client";

import { useUserData } from "@/hooks/useUserData";
import FreeTrial from "@/components/reelty/FreeTrial";
import HomeHeader from "@/components/reelty/HomeHeader";
import {
  SubscriptionTier,
  SUBSCRIPTION_TIERS,
} from "@/constants/subscription-tiers";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: userData, isLoading } = useUserData();

  // Only show banner if user is logged in AND not a paid member
  // Don't try to access userData properties if it's still loading
  const isFreeTier = userData?.currentTier?.id === SUBSCRIPTION_TIERS.FREE.id;
  const showBanner = !isLoading && userData && isFreeTier;

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Free Trial Banner - if user is logged in and not paid */}
      {showBanner && (
        <div className='fixed top-0 left-0 right-0 z-50'>
          <FreeTrial />
        </div>
      )}

      {/* Main Content - pushed down when banner is shown */}
      <div className={`flex-1 flex flex-col ${showBanner ? "mt-[54px]" : ""}`}>
        <HomeHeader />
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  );
}
