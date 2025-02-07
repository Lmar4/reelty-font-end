import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Reelty",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Profile</h2>
          <p className='text-sm text-gray-600 mb-4'>
            Update your personal information and how others see you on the
            platform.
          </p>
          <a
            href='/settings/profile'
            className='text-sm text-primary hover:underline'
          >
            Manage Profile →
          </a>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Billing</h2>
          <p className='text-sm text-gray-600 mb-4'>
            View your billing history and manage your payment methods.
          </p>
          <a
            href='/settings/billing'
            className='text-sm text-primary hover:underline'
          >
            Manage Billing →
          </a>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Usage</h2>
          <p className='text-sm text-gray-600 mb-4'>
            Monitor your platform usage and resource consumption.
          </p>
          <a
            href='/settings/usage'
            className='text-sm text-primary hover:underline'
          >
            View Usage →
          </a>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='text-lg font-semibold mb-2'>Account</h2>
          <p className='text-sm text-gray-600 mb-4'>
            Manage your account security and preferences.
          </p>
          <a
            href='/settings/account'
            className='text-sm text-primary hover:underline'
          >
            Manage Account →
          </a>
        </div>
      </div>
    </div>
  );
}
