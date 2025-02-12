"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { AdminUser, UserManageModalProps } from "@/types/admin";

export function UserManageModal({ user, onClose }: UserManageModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [creditAdjustment, setCreditAdjustment] = useState("");
  const [newStatus, setNewStatus] = useState<AdminUser["subscriptionStatus"]>(
    user?.subscriptionStatus || "INACTIVE"
  );

  const handleStatusChange = (value: AdminUser["subscriptionStatus"]) => {
    setNewStatus(value);
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);

      // Update credits if adjustment provided
      if (creditAdjustment) {
        const amount = parseInt(creditAdjustment, 10);
        
        // Validate credit removal
        if (amount < 0 && Math.abs(amount) > user.credits) {
          toast.error(`Cannot remove ${Math.abs(amount)} credits. User only has ${user.credits} credits.`);
          return;
        }

        const response = await fetch(`/api/admin/users/${user.id}/credits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            reason: amount >= 0 ? "Credits added by admin" : "Credits removed by admin",
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Failed to adjust credits");
        }

        const data = await response.json();
        if (data.success && data.data.credits !== undefined) {
          user.credits = data.data.credits;
        }

        toast.success(
          `Successfully ${amount >= 0 ? 'added' : 'removed'} ${Math.abs(amount)} credits`
        );
      }

      // Update status if changed
      if (newStatus && newStatus !== user.subscriptionStatus) {
        const response = await fetch(`/api/admin/users/${user.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to update status");
        }
      }

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>
            Update {user.firstName}&apos;s account settings and credits
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Adjust Credits</label>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='text-sm text-muted-foreground'>
                  Current Credits: {user.credits || 0}
                </div>
                <Badge
                  variant={
                    user.credits > 10
                      ? 'default'
                      : user.credits > 0
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {user.credits > 10 ? 'Good' : user.credits > 0 ? 'Low' : 'Empty'}
                </Badge>
              </div>
              <div className='flex gap-2'>
                <Input
                  type='number'
                  value={creditAdjustment}
                  onChange={(e) => setCreditAdjustment(e.target.value)}
                  placeholder='Enter amount (negative to remove)'
                />
                <Button
                  onClick={() => handleSave()}
                  disabled={!creditAdjustment || isLoading}
                  variant={parseInt(creditAdjustment) >= 0 ? 'default' : 'destructive'}
                >
                  {parseInt(creditAdjustment) >= 0 ? 'Add' : 'Remove'}
                </Button>
              </div>
              <div className='text-sm text-muted-foreground'>
                Note: Credits expire after 30 days
              </div>
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Status</label>
            <Select
              value={user.subscriptionStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='CANCELED'>Canceled</SelectItem>
                <SelectItem value='INCOMPLETE'>Incomplete</SelectItem>
                <SelectItem value='INCOMPLETE_EXPIRED'>
                  Incomplete Expired
                </SelectItem>
                <SelectItem value='PAST_DUE'>Past Due</SelectItem>
                <SelectItem value='TRIALING'>Trialing</SelectItem>
                <SelectItem value='UNPAID'>Unpaid</SelectItem>
                <SelectItem value='INACTIVE'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
