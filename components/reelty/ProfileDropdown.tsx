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
import { useQuery } from "@tanstack/react-query";

type UserRole = "USER" | "ADMIN" | "AGENCY" | "AGENCY_USER";

type MenuItem = {
  title: string;
  href: string;
  icon: any;
  roles?: UserRole[];
};

type BackendUser = {
  id: string;
  role: UserRole;
  email: string;
  firstName: string | null;
  lastName: string | null;
  // Add other fields as needed
};

const useBackendUser = () => {
  const { user: clerkUser } = useUser();

  return useQuery<BackendUser>({
    queryKey: ["user", clerkUser?.id],
    queryFn: async () => {
      const response = await fetch("/api/users/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
    enabled: !!clerkUser,
  });
};

export function ProfileDropdown() {
  const { user: clerkUser } = useUser();
  const { data: backendUser, isLoading } = useBackendUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!clerkUser || isLoading) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const userRole = backendUser?.role || "USER";

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
