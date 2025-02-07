"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import FreeTrial from "./FreeTrial";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isPaidMember?: boolean;
}

export default function DashboardLayout({
  children,
  isPaidMember = false,
}: DashboardLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className='min-h-screen bg-white'>
      {!isPaidMember && <FreeTrial />}
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
}
