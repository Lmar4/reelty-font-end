"use client";

import Link from "next/link";
import { ProfileDropdown } from "./ProfileDropdown";
import Image from "next/image";

export function DashboardHeader() {
  return (
    <header className='w-full bg-white '>
      <div className='max-w-[1200px] w-full mx-auto'>
        <nav className='flex items-center justify-between h-16 px-4 md:px-6'>
          {/* Left side - Logo */}
          <Link href='/dashboard' className='flex items-center'>
            <Image
              src='/images/logo.svg'
              alt='Reelty Logo'
              width={90}
              height={24}
              className='flex-shrink-0 md:w-[100px] md:h-[27px]'
            />
          </Link>

          {/* Right side - Dashboard text and Profile */}
          <div className='flex items-center gap-6'>
            <Link
              href='/dashboard'
              className='text-[14px] font-semibold text-[#1c1c1c] cursor-pointer'
            >
              Dashboard
            </Link>
            <ProfileDropdown />
          </div>
        </nav>
      </div>
    </header>
  );
}
