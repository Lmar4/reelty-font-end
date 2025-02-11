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
import { BulkDiscount } from "@/types/agency";
import { formatDate } from "@/lib/utils";

export function BulkDiscountsSection() {
  const [editingDiscount, setEditingDiscount] = useState<BulkDiscount | null>(
    null
  );

  const { data: discounts, isLoading } = useQuery({
    queryKey: ["bulk-discounts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/bulk-discounts");
      if (!response.ok) {
        throw new Error("Failed to fetch bulk discounts");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
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
            <TableHead>Users</TableHead>
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
                {discount.currentUsers} / {discount.maxUsers}
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
