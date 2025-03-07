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
  const [localUser, setLocalUser] = useState<AdminUser | null>(user);
  const [newStatus, setNewStatus] = useState<string>(
    user?.subscriptionStatus || "INACTIVE"
  );

  // Update local user when the prop changes
  if (user && (!localUser || user.id !== localUser.id)) {
    setLocalUser(user);
    setNewStatus(user.subscriptionStatus || "INACTIVE");
  }

  const handleStatusChange = (value: string) => {
    setNewStatus(value);
  };

  const handleCreditChange = async (amount: number, reason: string) => {
    if (!localUser) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/admin/users/${localUser.id}/credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to update credits");
      }

      const data = await response.json();

      // Update the local user state with new credit amount
      setLocalUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          credits: data.data.creditsRemaining,
        };
      });

      toast.success(
        `${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} credits.`
      );

      // Refresh the user list
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!localUser) {
      return;
    }

    try {
      setIsLoading(true);

      // Update credits if adjustment provided
      if (creditAdjustment) {
        const amount = parseInt(creditAdjustment, 10);

        // Validate credit removal
        if (amount < 0 && Math.abs(amount) > (localUser.credits || 0)) {
          toast.error(
            `Cannot remove ${Math.abs(amount)} credits. User only has ${
              localUser.credits || 0
            } credits.`
          );
          return;
        }

        await handleCreditChange(
          amount,
          amount >= 0 ? "Credits added by admin" : "Credits removed by admin"
        );
      }

      // Update status if changed
      if (newStatus && newStatus !== localUser.subscriptionStatus) {
        const response = await fetch(
          `/api/admin/users/${localUser.id}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          }
        );

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

  if (!localUser) {
    return null;
  }

  return (
    <Dialog open={!!localUser} onOpenChange={() => onClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>
            Update {localUser.firstName}&apos;s account settings and credits
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Adjust Credits</label>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='text-sm text-muted-foreground'>
                  Current Credits: {localUser.credits || 0}
                </div>
                <Badge
                  variant={
                    (localUser.credits || 0) > 10
                      ? "default"
                      : (localUser.credits || 0) > 0
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {(localUser.credits || 0) > 10
                    ? "Good"
                    : (localUser.credits || 0) > 0
                    ? "Low"
                    : "Empty"}
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
                  variant={
                    parseInt(creditAdjustment) >= 0 ? "default" : "destructive"
                  }
                >
                  {parseInt(creditAdjustment) >= 0 ? "Add" : "Remove"}
                </Button>
              </div>
              <div className='text-sm text-muted-foreground'>
                Note: Credits expire after 30 days
              </div>
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Status</label>
            <Select value={newStatus} onValueChange={handleStatusChange}>
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
