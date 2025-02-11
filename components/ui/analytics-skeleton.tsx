import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";

export function AnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[180px]' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Stats Grid */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-[120px]' />
                <Skeleton className='h-6 w-[80px]' />
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className='mt-6'>
            <Skeleton className='h-[200px] w-full' />
          </div>

          {/* Table Skeleton */}
          <div className='mt-6 space-y-2'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center justify-between'>
                <Skeleton className='h-4 w-[140px]' />
                <Skeleton className='h-4 w-[60px]' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
