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
import { EditTierDialog } from "./edit-tier-dialog";
import { SubscriptionTier } from "@/types/prisma-types";
import { formatCurrency } from "@/lib/utils";

export function SubscriptionTiersSection() {
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: tiers, isLoading } = useQuery({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subscription-tiers");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription tiers");
      }
      return response.json();
    },
  });

  const handleAddTier = () => {
    setEditingTier(null);
    setIsDialogOpen(true);
  };

  const handleEditTier = (tier: SubscriptionTier) => {
    setEditingTier(tier);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingTier(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <div className='animate-pulse bg-gray-200 h-8 w-48 rounded' />
          <div className='animate-pulse bg-gray-200 h-10 w-32 rounded' />
        </div>

        <div className='bg-white rounded-lg shadow'>
          <div className='p-6 space-y-4'>
            <div className='grid grid-cols-5 gap-4 pb-4 border-b'>
              <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-32 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-16 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-24 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
            </div>

            {[...Array(4)].map((_, i) => (
              <div key={i} className='grid grid-cols-5 gap-4 py-4'>
                <div className='animate-pulse bg-gray-200 h-6 w-24 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-48 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
                <div className='space-y-2'>
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className='animate-pulse bg-gray-200 h-4 w-32 rounded'
                    />
                  ))}
                </div>
                <div className='animate-pulse bg-gray-200 h-8 w-16 rounded' />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold'>Subscription Tiers</h2>
          <p className='text-muted-foreground'>
            Manage subscription tiers and their features
          </p>
        </div>
        <Button onClick={handleAddTier}>Add New Tier</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers?.data?.map((tier: SubscriptionTier) => (
            <TableRow key={tier.id}>
              <TableCell className='font-medium'>{tier.name}</TableCell>
              <TableCell>{tier.description}</TableCell>
              <TableCell>{formatCurrency(tier.monthlyPrice)}</TableCell>
              <TableCell>
                <ul className='list-disc list-inside'>
                  {tier.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                <Button variant='ghost' onClick={() => handleEditTier(tier)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditTierDialog
        tier={editingTier}
        open={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
