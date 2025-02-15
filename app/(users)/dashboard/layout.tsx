"use client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='flex flex-col min-h-screen'>
        {/* Main Content */}

        <div className='max-w-[1200px] mx-auto sm:px-4 sm:py-8 md:py-16 w-full'>
          {children}
        </div>
      </div>
    </>
  );
}
