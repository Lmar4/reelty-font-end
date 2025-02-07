import DashboardLayout from "@/components/reelty/DashboardLayout";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-white flex flex-col justify-between'>
      <DashboardLayout>
        <main className='flex-1'>{children}</main>
      </DashboardLayout>
    </div>
  );
}
