"use client";

import { MobileNav } from "@/components/reelty/MobileNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='container mx-auto px-4 pb-20 md:pb-8'>
        <div className='flex flex-col md:flex-row gap-8 pt-4'>
          {/* Main Content */}
          <main className='flex-1'>
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
}
