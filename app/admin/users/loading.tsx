import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <div className='container mx-auto py-6 space-y-6'>
      <PageHeader
        heading='User Management'
        subheading='View and manage all registered users'
      />

      <Separator className='my-6' />

      <div className='space-y-4'>
        {/* Filters skeleton */}
        <div className='bg-white p-4 rounded-lg shadow space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className='h-4 w-24' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-32' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-28' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-24' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-32' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-28' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-32' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-32' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className='flex items-center justify-between px-2 py-4'>
          <div className='flex items-center gap-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-8' />
            ))}
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
      </div>
    </div>
  );
}
