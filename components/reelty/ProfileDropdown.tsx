"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isOpen) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, onClose]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className='absolute right-0 mt-2 w-[200px] bg-white rounded-lg shadow-[0_0_50px_0_rgb(0,0,0,0.30)] border border-[#e5e7eb] py-2'
    >
      {/* Menu Items */}
      <div className='py-1'>
        <Link
          href='/account'
          className='flex items-center px-4 py-2 text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'
          onClick={onClose}
        >
          <svg
            className='w-5 h-5 mr-3 text-[#1c1c1c]/60 flex-shrink-0'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
            <circle cx='12' cy='7' r='4' />
          </svg>
          Account
        </Link>
        <Link
          href='/usage'
          className='flex items-center px-4 py-2 text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'
          onClick={onClose}
        >
          <svg
            className='w-5 h-5 mr-3 text-[#1c1c1c]/60 flex-shrink-0'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M4 4h16v16H4z' />
            <path d='M4 12h16M12 4v16' />
          </svg>
          Usage
        </Link>
        <Link
          href='/billing'
          className='flex items-center px-4 py-2 text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'
          onClick={onClose}
        >
          <svg
            className='w-5 h-5 mr-3 text-[#1c1c1c]/60 flex-shrink-0'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <rect x='2' y='4' width='20' height='16' rx='2' />
            <path d='M2 10h20' />
          </svg>
          Billing
        </Link>
      </div>

      {/* Sign Out */}
      <div className='border-t py-1'>
        <button
          onClick={handleSignOut}
          className='flex items-center w-full text-left px-4 py-2 text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'
        >
          <svg
            className='w-5 h-5 mr-3 text-[#1c1c1c]/60 flex-shrink-0'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
            <polyline points='16 17 21 12 16 7' />
            <line x1='21' y1='12' x2='9' y2='12' />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
}
