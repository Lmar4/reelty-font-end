"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  BarChart,
  CreditCard,
  Home,
  Users,
  Building2,
  FileText,
  Layout,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MenuItem = {
  title: string;
  href: string;
  icon: any;
  roles?: ("USER" | "ADMIN" | "AGENCY" | "AGENCY_USER")[];
};

export function ProfileDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Get user role from metadata (you'll need to set this up in Clerk)
  const userRole =
    (user.publicMetadata?.role as
      | "USER"
      | "ADMIN"
      | "AGENCY"
      | "AGENCY_USER") || "USER";

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["USER", "ADMIN", "AGENCY", "AGENCY_USER"],
    },
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: Layout,
      roles: ["ADMIN"],
    },
    {
      title: "Agency Dashboard",
      href: "/agency",
      icon: Building2,
      roles: ["AGENCY"],
    },
    {
      title: "Team Members",
      href: "/agency/team",
      icon: Users,
      roles: ["AGENCY"],
    },
    {
      title: "Templates",
      href: "/admin/templates",
      icon: FileText,
      roles: ["ADMIN"],
    },
    {
      title: "Account",
      href: "/settings/account",
      icon: Settings,
      roles: ["USER", "ADMIN", "AGENCY", "AGENCY_USER"],
    },
    {
      title: "Usage",
      href: "/settings/usage",
      icon: BarChart,
      roles: ["USER", "ADMIN", "AGENCY", "AGENCY_USER"],
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: CreditCard,
      roles: ["USER", "ADMIN", "AGENCY"],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary text-white'
      >
        <img
          alt={user.fullName || ""}
          src={user.imageUrl}
          width={32}
          height={32}
          className='w-full h-full object-cover'
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-[200px] bg-white rounded-lg shadow-[0_0_50px_0_rgb(0,0,0,0.30)] border border-[#e5e7eb] py-2'>
          <div className='py-1'>
            {filteredMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='flex items-center mx-2 px-3 py-2 text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7] rounded-md'
                onClick={() => setIsOpen(false)}
              >
                <item.icon className='w-5 h-5 mr-3 text-[#1c1c1c]/60 flex-shrink-0' />
                {item.title}
              </Link>
            ))}
          </div>
          <div className='border-t py-1'>
            <button
              onClick={handleSignOut}
              className='flex items-center w-[calc(100%-16px)] text-left mx-2 px-3 py-2 text-[15px] font-semibold text-red-600 hover:bg-[#f7f7f7] rounded-md'
            >
              <LogOut className='w-5 h-5 mr-3 text-red-600/60 flex-shrink-0' />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
