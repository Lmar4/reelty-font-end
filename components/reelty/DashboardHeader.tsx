"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileDropdown } from "./ProfileDropdown";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { UserRole } from "@/types/prisma-types";
import { useRole } from "@/hooks/useRole";

type NavigationItem = {
  name: string;
  href: string;
  roles?: UserRole[];
};

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Admin Dashboard", href: "/admin", roles: ["ADMIN"] },
  { name: "Agency Dashboard", href: "/agency", roles: ["AGENCY"] },
  { name: "Settings", href: "/settings" },
];

export function DashboardHeader() {
  const { user } = useUser();
  const pathname = usePathname();

  // Get user role from your database - you'll need to implement this hook
  const userRole = useRole();

  if (!user) return null;

  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

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
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname.includes(item.href)
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
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
