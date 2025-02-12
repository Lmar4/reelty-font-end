"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClerk, useUser } from "@clerk/nextjs";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account data");
      }

      await user?.delete();
      await signOut();
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Account Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account security and preferences.
        </p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-x-4 gap-y-2'>
              <div className='text-sm font-medium text-gray-500'>Name</div>
              <div className='text-sm'>
                {user?.firstName} {user?.lastName}
              </div>
              <div className='text-sm font-medium text-gray-500'>Email</div>
              <div className='text-sm break-all'>
                {user?.emailAddresses[0]?.emailAddress}
              </div>
              <div className='text-sm font-medium text-gray-500'>
                Account Created
              </div>
              <div className='text-sm'>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Key className='h-5 w-5 text-gray-400' />
                <div>
                  <h4 className='text-sm font-medium'>Password</h4>
                  <p className='text-sm text-gray-500'>
                    Change your account password
                  </p>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                Change Password
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Shield className='h-5 w-5 text-gray-400' />
                <div>
                  <h4 className='text-sm font-medium'>
                    Two-Factor Authentication
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle className='text-red-600'>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Trash2 className='h-5 w-5 text-red-500' />
                <div>
                  <h4 className='text-sm font-medium'>Delete Account</h4>
                  <p className='text-sm text-gray-500'>
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
