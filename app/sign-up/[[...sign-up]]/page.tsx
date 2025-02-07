"use client";

import { SignUp } from "@clerk/nextjs";
import HomeHeader from "@/components/reelty/HomeHeader";

export default function SignUpPage() {
  return (
    <>
      <HomeHeader />
      <div className='min-h-screen flex items-center justify-center bg-white px-4'>
        <SignUp />
      </div>
    </>
  );
}
