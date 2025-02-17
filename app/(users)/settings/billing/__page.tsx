import { BillingClient } from "@/components/billing/BillingClient";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

interface SubscriptionData {
  subscription: any;
  // invoices: any[]; // Temporarily disabled
  usageStats: any;
}

// Data fetching functions
async function fetchSubscriptionData(
  userId: string,
  sessionToken: string
): Promise<SubscriptionData> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const requestHeaders = {
    Authorization: `Bearer ${sessionToken}`,
    "Content-Type": "application/json",
  };

  const [subResponse, statsResponse] = await Promise.all([
    fetch(`${baseUrl}/api/subscription/status?userId=${userId}`, {
      headers: requestHeaders,
      cache: "no-store", // Always fetch fresh data for subscription status
    }),
    fetch(`${baseUrl}/api/subscription/usage?userId=${userId}`, {
      headers: requestHeaders,
      cache: "no-store", // Always fetch fresh usage data
    }),
  ]);

  // Handle potential errors individually for better error reporting
  if (!subResponse.ok) {
    throw new Error(`Subscription status error: ${subResponse.statusText}`);
  }
  if (!statsResponse.ok) {
    throw new Error(`Usage stats error: ${statsResponse.statusText}`);
  }

  // Parse responses individually to handle potential JSON parsing errors
  const { data: subscription } = await subResponse.json();
  const { data: usageStats } = await statsResponse.json();

  return {
    subscription: subscription ?? null,
    // invoices: [], // Temporarily disabled
    usageStats: usageStats ?? null,
  };
}

const LoadingSkeleton = () => (
  <div className='max-w-[800px] mx-auto px-4 py-16 space-y-8'>
    <Skeleton className='h-8 w-48' />
    <div className='space-y-4'>
      <Skeleton className='h-[200px] w-full' />
      <div className='flex gap-4'>
        <Skeleton className='h-10 w-40' />
        <Skeleton className='h-10 w-40' />
      </div>
    </div>
    <div className='space-y-4'>
      <Skeleton className='h-[300px] w-full' />
    </div>
    <div className='space-y-4'>
      <Skeleton className='h-[200px] w-full' />
    </div>
  </div>
);

export default async function BillingSettings() {
  const user = await currentUser();
  const session = await auth();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const sessionToken = await session?.getToken();
  if (!sessionToken) {
    throw new Error("No session token available");
  }

  const subscriptionData = await fetchSubscriptionData(user.id, sessionToken);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BillingClient subscriptionData={subscriptionData} userId={user.id} />
    </Suspense>
  );
}
