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

  if (isLoading) {
    return <div>Loading...</div>;
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
        <Button onClick={() => setEditingTier({} as SubscriptionTier)}>
          Add New Tier
        </Button>
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
          {tiers?.map((tier: SubscriptionTier) => (
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
                <Button variant='ghost' onClick={() => setEditingTier(tier)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditTierDialog
        tier={editingTier}
        open={!!editingTier}
        onClose={() => setEditingTier(null)}
      />
    </div>
  );
}
