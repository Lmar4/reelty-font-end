import { AdminNav } from "./_components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gray-100 '>
      <AdminNav />
      <main className='container mx-auto px-4 py-16'>{children}</main>
    </div>
  );
}
