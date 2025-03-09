import { Suspense } from "react";
import { UserList } from "./_components/user-list";
import { UserFilters } from "./_components/user-filters";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import Loading from "./loading";
import { LifetimePlanSummary } from "./_components/lifetime-plan-summary";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users and their subscriptions",
};

export default function UsersPage() {
  return (
    <div className='container mx-auto py-6 space-y-6 '>
      <PageHeader
        heading='User Management'
        subheading='View and manage all registered users'
      />

      <Separator className='my-6' />

      <UserFilters />

      <Suspense fallback={<Loading />}>
        <LifetimePlanSummary />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <UserList />
      </Suspense>
    </div>
  );
}
