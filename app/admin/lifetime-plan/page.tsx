import { Suspense } from "react";
import { LifetimePlanStats } from "./_components/lifetime-plan-stats";
import { LifetimePlanSubscribers } from "./_components/lifetime-plan-subscribers";
import { AnalyticsSkeleton } from "@/components/ui/analytics-skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export default async function LifetimePlanPage() {
  return (
    <div className='container mx-auto p-6 space-y-8 pt-4 md:pt-0'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Lifetime Plan Management</h1>
      </div>

      <div className='grid gap-6'>
        <Suspense fallback={<AnalyticsSkeleton />}>
          <LifetimePlanStats />
        </Suspense>

        <Suspense fallback={<AnalyticsSkeleton />}>
          <LifetimePlanSubscribers />
        </Suspense>
      </div>
    </div>
  );
}
