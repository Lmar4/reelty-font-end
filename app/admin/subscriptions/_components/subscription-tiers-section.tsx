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
      const result = await response.json();
      console.log("API Response:", result);
      return result;
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
            <div className='grid grid-cols-6 gap-4 pb-4 border-b'>
              <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-32 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-16 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-24 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
              <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
            </div>

            {[...Array(4)].map((_, i) => (
              <div key={i} className='grid grid-cols-6 gap-4 py-4'>
                <div className='animate-pulse bg-gray-200 h-6 w-24 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-48 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-20 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-32 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-24 rounded' />
                <div className='animate-pulse bg-gray-200 h-6 w-16 rounded' />
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
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(tiers?.data) ? (
            tiers.data.map((tier: SubscriptionTier) => (
              <TableRow key={tier.id}>
                <TableCell className='font-medium'>{tier.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tier.planType === "MONTHLY" ? "default" : "secondary"
                    }
                  >
                    {tier.planType === "MONTHLY" ? "Monthly" : "Pay As You Go"}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(tier.monthlyPrice)}</TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {tier.creditsPerInterval} credit
                    {tier.creditsPerInterval !== 1 && "s"}
                    {tier.planType === "MONTHLY" && "/month"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='flex flex-wrap gap-1'>
                      {tier.maxPhotosPerListing && (
                        <Badge variant='secondary'>
                          {tier.maxPhotosPerListing} photos/listing
                        </Badge>
                      )}
                      {tier.maxActiveListings && (
                        <Badge variant='secondary'>
                          {tier.maxActiveListings} active listings
                        </Badge>
                      )}
                      {!tier.hasWatermark && (
                        <Badge variant='secondary'>No Watermark</Badge>
                      )}
                      {tier.premiumTemplatesEnabled && (
                        <Badge variant='secondary'>Premium Templates</Badge>
                      )}
                    </div>
                    {tier.features.length > 0 && (
                      <div className='text-sm text-muted-foreground'>
                        {tier.features.join(", ")}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>Active</Badge>
                </TableCell>
                <TableCell>
                  <Button variant='ghost' onClick={() => handleEditTier(tier)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='text-center py-4'>
                No subscription tiers found. Add a new tier to get started.
              </TableCell>
            </TableRow>
          )}
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
