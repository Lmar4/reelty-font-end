"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user } = useUser();
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
      // TODO: Implement account deletion
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error("Failed to delete account");
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
        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-4'>Account Information</h2>
          <div className='space-y-2'>
            <div className='grid grid-cols-2 gap-2'>
              <span className='text-sm text-gray-600'>Name:</span>
              <span className='text-sm'>
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <span className='text-sm text-gray-600'>Email:</span>
              <span className='text-sm'>
                {user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <span className='text-sm text-gray-600'>Account Created:</span>
              <span className='text-sm'>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-4'>Security</h2>
          <div className='space-y-4'>
            <div>
              <button
                className='text-sm text-primary hover:underline'
                onClick={() => {
                  /* TODO: Implement password change */
                }}
              >
                Change Password
              </button>
            </div>
            <div>
              <button
                className='text-sm text-primary hover:underline'
                onClick={() => {
                  /* TODO: Implement 2FA settings */
                }}
              >
                Two-Factor Authentication Settings
              </button>
            </div>
          </div>
        </div>

        <div className='rounded-lg border p-4 bg-red-50'>
          <h2 className='text-lg font-semibold mb-4 text-red-600'>
            Danger Zone
          </h2>
          <p className='text-sm text-red-600 mb-4'>
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className='bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50'
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
