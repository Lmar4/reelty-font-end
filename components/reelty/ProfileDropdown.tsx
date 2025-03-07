"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart,
  Building2,
  CreditCard,
  FileText,
  Home,
  Layout,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useRoleAccess } from "@/hooks/useRoleAccess";

type MenuItem = {
  title: string;
  href: string;
  icon: any;
  hidden?: boolean;
};

export function ProfileDropdown() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the new role access hooks
  const isAdmin = useRoleAccess("ADMIN");
  const isAgency = useRoleAccess("AGENCY");
  const isAgencyUser = useRoleAccess("AGENCY_USER");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!clerkUser) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      // Show to all users
    },
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: Layout,
      hidden: !isAdmin,
    },
    {
      title: "Agency Dashboard",
      href: "/agency",
      icon: Building2,
      hidden: !isAgency,
    },
    {
      title: "Team Members",
      href: "/agency/team",
      icon: Users,
      hidden: !isAgency,
    },
    {
      title: "Templates",
      href: "/admin/settings",
      icon: FileText,
      hidden: !isAdmin,
    },
    {
      title: "Account",
      href: "/settings/account",
      icon: Settings,
      // Show to all users
    },
    {
      title: "Usage",
      href: "/settings/usage",
      icon: BarChart,
      // Show to all users
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: CreditCard,
      // Show to all users except agency users
      hidden: isAgencyUser,
    },
  ];

  // Filter out hidden menu items
  const filteredMenuItems = menuItems.filter((item) => !item.hidden);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary text-white'
      >
        <img
          alt={clerkUser.fullName || ""}
          src={clerkUser.imageUrl}
          width={32}
          height={32}
          className='w-full h-full object-cover'
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-[200px] bg-white rounded-lg shadow-[0_0_50px_0_rgb(0,0,0,0.30)] border border-[#e5e7eb] py-2 z-50'>
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
