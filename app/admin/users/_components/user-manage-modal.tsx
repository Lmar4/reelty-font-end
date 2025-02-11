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
  const [newStatus, setNewStatus] = useState<AdminUser["status"]>(
    user?.status || "inactive"
  );

  const handleStatusChange = (value: AdminUser["status"]) => {
    setNewStatus(value);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Update credits if adjustment provided
      if (creditAdjustment) {
        const response = await fetch(`/api/admin/users/${user.id}/credits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(creditAdjustment, 10),
            reason: "Manual adjustment by admin",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to adjust credits");
        }
      }

      // Update status if changed
      if (newStatus && newStatus !== user.status) {
        const response = await fetch(`/api/admin/users/${user.id}/status`, {
          method: "POST",
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

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>
            Update {user.name}'s account settings and credits
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Adjust Credits</label>
            <div className='flex flex-col justify-start items-center gap-2'>
              <Input
                type='number'
                value={creditAdjustment}
                onChange={(e) => setCreditAdjustment(e.target.value)}
                placeholder='Enter amount (+ or -)'
              />
              <div className='text-sm text-muted-foreground w-full'>
                Current: {user.credits}
              </div>
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Status</label>
            <Select value={user.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='canceled'>Canceled</SelectItem>
                <SelectItem value='incomplete'>Incomplete</SelectItem>
                <SelectItem value='incomplete_expired'>
                  Incomplete Expired
                </SelectItem>
                <SelectItem value='past_due'>Past Due</SelectItem>
                <SelectItem value='trialing'>Trialing</SelectItem>
                <SelectItem value='unpaid'>Unpaid</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
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
