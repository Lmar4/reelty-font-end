import { Suspense } from "react";
import { GrantCreditsForm } from "../components/GrantCreditsForm";
import { getCreditAnalytics } from "../actions";

export const metadata = {
  title: "Admin - Credits Management",
  description: "Manage user credits and grant credits to users",
};

async function CreditAnalytics() {
  const analytics = await getCreditAnalytics();

  // Calculate used credits (this would normally come from the API)
  const usedCredits = 0; // Placeholder

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <div className='rounded-lg border p-4'>
        <h3 className='text-sm font-medium'>Total Credits</h3>
        <p className='text-2xl font-bold'>{analytics.totalCredits}</p>
      </div>
      <div className='rounded-lg border p-4'>
        <h3 className='text-sm font-medium'>Used Credits</h3>
        <p className='text-2xl font-bold'>{usedCredits}</p>
      </div>
      <div className='rounded-lg border p-4'>
        <h3 className='text-sm font-medium'>Remaining Credits</h3>
        <p className='text-2xl font-bold'>
          {analytics.totalCredits - usedCredits}
        </p>
      </div>
    </div>
  );
}

export default async function AdminCreditsPage() {
  // In a real app, you would get the current user from your auth system
  // and check if they have admin permissions
  const adminId = "admin-123"; // Placeholder
  const adminName = "Admin User"; // Placeholder

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold'>Credits Management</h1>
        <p className='text-muted-foreground'>
          View credit analytics and grant credits to users
        </p>
      </div>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <CreditAnalytics />
      </Suspense>

      <div className='grid gap-8 md:grid-cols-2'>
        <GrantCreditsForm adminId={adminId} adminName={adminName} />

        <div className='rounded-lg border p-6'>
          <h2 className='text-xl font-semibold mb-4'>Recent Credit Grants</h2>
          <p className='text-muted-foreground'>
            This section will show recent credit grants by admins.
          </p>
          {/* In a real app, you would fetch and display recent credit grants here */}
        </div>
      </div>
    </div>
  );
}
