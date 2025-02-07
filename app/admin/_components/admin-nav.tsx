"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Settings,
  Users,
  CreditCard,
  FileVideo,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Overview",
    icon: BarChart3,
    href: "/admin",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
    color: "text-violet-500",
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/admin/subscriptions",
    color: "text-pink-700",
  },
  {
    label: "Videos",
    icon: FileVideo,
    href: "/admin/videos",
    color: "text-orange-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-500",
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b bg-white px-4 shadow-sm'>
      <div className='flex items-center space-x-4'>
        <Link href='/admin' className='flex items-center'>
          <h1 className='text-xl font-bold'>Reelty Admin</h1>
        </Link>
        <nav className='flex items-center space-x-4 lg:space-x-6 mx-6'>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              <div className='flex items-center gap-x-2'>
                <route.icon className={cn("h-4 w-4", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <div className='ml-auto flex items-center space-x-4'>
        <UserButton afterSignOutUrl='/' />
      </div>
    </div>
  );
}
