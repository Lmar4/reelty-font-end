"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AgencyUser, AgencyUserStats } from "@/types/agency";
import { formatDate } from "@/lib/utils";
import { InviteUserDialog } from "./invite-user-dialog";

interface AgencyUsersDialogProps {
  agency: AgencyUser | null;
  open: boolean;
  onClose: () => void;
}

export function AgencyUsersDialog({
  agency,
  open,
  onClose,
}: AgencyUsersDialogProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["agency-users", agency?.id],
    queryFn: async () => {
      if (!agency?.id) {
        return null;
      }
      const response = await fetch(`/api/admin/agencies/${agency.id}/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch agency users");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!agency?.id,
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `/api/admin/agencies/${agency?.id}/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agency-users", agency?.id],
      });
      toast.success("User removed successfully");
      setUserToRemove(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove user"
      );
      setUserToRemove(null);
    },
  });

  const handleRemoveUser = (userId: string) => {
    setUserToRemove(userId);
  };

  if (!agency) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Agency Users - {agency.agencyName}</DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-muted-foreground'>
                  Managing users for {agency.agencyName}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {users?.length || 0} of {agency.agencyMaxUsers} users
                </p>
              </div>
              <Button
                onClick={() => setIsInviting(true)}
                disabled={(users?.length || 0) >= (agency.agencyMaxUsers || 0)}
              >
                Invite User
              </Button>
            </div>

            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <div className='text-muted-foreground'>Loading users...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Videos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: AgencyUserStats) => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {user.usedCredits} / {user.totalCredits}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.lastActive)}</TableCell>
                      <TableCell>{user.videoGenerations}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            new Date(user.lastActive) >
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                              ? "default"
                              : "secondary"
                          }
                        >
                          {new Date(user.lastActive) >
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          onClick={() => handleRemoveUser(user.userId)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <InviteUserDialog
            agency={agency}
            open={isInviting}
            onClose={() => setIsInviting(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setUserToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() =>
                userToRemove && removeUserMutation.mutate(userToRemove)
              }
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
