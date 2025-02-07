"use client";

import Link from "next/link";
import { ProfileDropdown } from "./ProfileDropdown";
import { useUser } from "@clerk/nextjs";

export function DashboardHeader() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <header className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <Link href='/dashboard' className='text-xl font-bold text-gray-900'>
              Reelty
            </Link>
          </div>
          <div className='flex items-center space-x-4'>
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
