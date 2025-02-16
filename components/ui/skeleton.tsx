import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export function PhotoSkeleton() {
  return (
    <div className='relative aspect-[3/4] overflow-hidden'>
      <Skeleton className='h-full w-full' />
    </div>
  );
}

export function PhotoGridSkeleton() {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
      {Array.from({ length: 10 }).map((_, i) => (
        <PhotoSkeleton key={i} />
      ))}
    </div>
  );
}

export function AddressInputSkeleton() {
  return (
    <div className='space-y-2'>
      <Skeleton className='h-4 w-20' />
      <Skeleton className='h-10 w-full' />
    </div>
  );
}

export { Skeleton };
