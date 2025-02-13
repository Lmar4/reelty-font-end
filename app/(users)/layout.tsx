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
    <div className='flex min-h-screen flex-col'>
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
}
