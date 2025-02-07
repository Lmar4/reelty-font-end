import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/reelty/DashboardLayout";
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <DashboardLayout>
        <main className='flex-1'>{children}</main>
      </DashboardLayout>
    </div>
  );
}
