"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileDropdown } from "./ProfileDropdown";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Image from "next/image";
const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Settings", href: "/settings" },
];

export function DashboardHeader() {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center space-x-8'>
            <Link href='/' className='flex items-center'>
              <Image
                src='/images/logo.svg'
                alt='Reelty Logo'
                width={100}
                height={27}
                className='flex-shrink-0 w-[90px] md:w-[120px] h-auto'
              />
            </Link>
            <nav className='hidden md:flex space-x-4'>
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className='flex items-center space-x-4'>
            <Link
              href='/dashboard/listings/'
              className='hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            >
              Create Listing
            </Link>
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
