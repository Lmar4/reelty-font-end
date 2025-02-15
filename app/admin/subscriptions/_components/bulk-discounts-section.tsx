"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditDiscountDialog } from "./edit-discount-dialog";
import { BulkDiscount } from "@/app/admin/types";
import { formatDate } from "@/lib/utils";
import { getBulkDiscounts } from "@/app/admin/actions";
import { Skeleton } from "@/components/ui/skeleton";

export function BulkDiscountsSection() {
  const [editingDiscount, setEditingDiscount] = useState<BulkDiscount | null>(
    null
  );

  const { data: discounts, isLoading } = useQuery({
    queryKey: ["bulk-discounts"],
    queryFn: getBulkDiscounts,
  });

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <Skeleton className='h-7 w-[200px]' />
            <Skeleton className='h-4 w-[300px] mt-2' />
          </div>
          <Skeleton className='h-10 w-[120px]' />
        </div>

        <div className='border rounded-lg'>
          <div className='relative w-full overflow-auto'>
            <table className='w-full caption-bottom text-sm'>
              <thead className='[&_tr]:border-b'>
                <tr className='border-b transition-colors'>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <th key={i} className='h-12 px-4 text-left align-middle'>
                      <Skeleton className='h-4 w-[80px]' />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='[&_tr:last-child]:border-0'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className='border-b transition-colors'>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <td key={i} className='p-4'>
                        <Skeleton className='h-4 w-[100px]' />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold'>Bulk Discounts</h2>
          <p className='text-muted-foreground'>
            Manage promotional discounts and special offers
          </p>
        </div>
        <Button onClick={() => setEditingDiscount({} as BulkDiscount)}>
          Create Discount
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Current Usage</TableHead>
            <TableHead>Total Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts?.map((discount: BulkDiscount) => (
            <TableRow key={discount.id}>
              <TableCell className='font-medium'>{discount.name}</TableCell>
              <TableCell>{discount.description}</TableCell>
              <TableCell>{discount.discountPercent}%</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{discount.currentUsers} / {discount.maxUsers}</span>
                  <span className="text-xs text-muted-foreground">current</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{discount.totalUsageCount}</span>
                  <span className="text-xs text-muted-foreground">total uses</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={discount.isActive ? "default" : "secondary"}>
                  {discount.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {discount.expiresAt
                  ? formatDate(discount.expiresAt)
                  : "No expiry"}
              </TableCell>
              <TableCell>
                <Button
                  variant='ghost'
                  onClick={() => setEditingDiscount(discount)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditDiscountDialog
        discount={editingDiscount}
        open={!!editingDiscount}
        onClose={() => setEditingDiscount(null)}
      />
    </div>
  );
}
