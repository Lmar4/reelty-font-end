"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Users,
  CreditCard,
  FileVideo,
  Settings,
  LayoutDashboard,
  Coins,
  Award,
} from "lucide-react";

interface Route {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;
  active: (pathname: string) => boolean;
}

const routes: Route[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: BarChart3,
    color: "text-sky-500",
    active: (pathname: string) => pathname === "/admin",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    color: "text-violet-500",
    active: (pathname: string) => pathname.startsWith("/admin/users"),
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    color: "text-pink-700",
    active: (pathname: string) => pathname.startsWith("/admin/subscriptions"),
  },
  {
    href: "/admin/lifetime-plan",
    label: "Lifetime Plan",
    icon: Award,
    color: "text-emerald-600",
    active: (pathname: string) => pathname.startsWith("/admin/lifetime-plan"),
  },
  // {
  //   href: "/admin/videos",
  //   label: "Videos",
  //   icon: FileVideo,
  //   color: "text-orange-700",
  //   active: (pathname: string) => pathname.startsWith("/admin/videos"),
  // },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    color: "text-gray-500",
    active: (pathname: string) => pathname.startsWith("/admin/settings"),
  },
  {
    href: "/dashboard",
    label: "User Dashboard",
    icon: LayoutDashboard,
    color: "text-yellow-500",
    active: (pathname: string) => pathname.startsWith("/dashboard"),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b bg-white px-4 shadow-sm'>
      <div className='w-full'>
        <div className='mx-auto max-w-[1200px] flex items-center justify-between px-4 md:px-6 py-4'>
          <Link href='/' className='flex items-center'>
            <Image
              src='/images/logo.svg'
              alt='Reelty Logo'
              width={100}
              height={40}
              priority
            />
          </Link>

          <nav className='flex items-center gap-6'>
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  route.active(pathname)
                    ? "text-black dark:text-white"
                    : "text-muted-foreground"
                )}
              >
                <route.icon className={cn("h-4 w-4 mr-2", route.color)} />
                {route.label}
              </Link>
            ))}
          </nav>

          <UserButton />
        </div>
      </div>
    </div>
  );
}
