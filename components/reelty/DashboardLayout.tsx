"use client";

import { useUserData } from "@/hooks/useUserData";
import { DashboardHeader } from "./DashboardHeader";
import FreeTrial from "./FreeTrial";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: userData, isLoading } = useUserData();
  const isPaidMember = userData?.subscriptionStatus === "ACTIVE";

  return (
    <div className='min-h-screen bg-white'>
      {!isLoading && !isPaidMember && <FreeTrial />}
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
}
