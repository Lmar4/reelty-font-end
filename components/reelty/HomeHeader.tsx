"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

export default function HomeHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? "border-b" : ""
      }`}
    >
      <div className='max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-6 py-2 md:py-4'>
        {/* Left side of header */}
        <div className='flex items-center gap-8'>
          {/* Logo */}
          <Link href='/' className='flex items-center'>
            <Image
              priority
              src='/images/logo.svg'
              alt='Reelty Logo'
              width={90}
              height={24}
              className='flex-shrink-0 md:w-[100px] md:h-[27px]'
            />
          </Link>
          {/* Pricing link - hidden on mobile */}
          <Link
            href='/pricing'
            className='hidden md:block px-4 py-1.5 rounded-lg text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7] transition-colors'
          >
            Pricing
          </Link>
        </div>

        {/* Navigation - visible on all screens */}
        <nav className='flex items-center gap-3 md:gap-8'>
          {isSignedIn ? (
            <Link
              href='/dashboard'
              className='px-3 md:px-4 py-1.5 rounded-lg text-[14px] md:text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7] transition-colors'
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href='/login'
                className='px-3 md:px-4 py-1.5 rounded-lg text-[14px] md:text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7] transition-colors'
              >
                Log in
              </Link>
              <Link
                href='/sign-up'
                className='bg-[#1c1c1c] text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full flex items-center gap-1 md:gap-2 text-[14px] md:text-[15px] font-bold hover:bg-[#1c1c1c]/90 transition-colors'
              >
                Get started
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='md:w-[14px] md:h-[14px]'
                >
                  <path d='M5 12h14' />
                  <path d='m12 5 7 7-7 7' />
                </svg>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
