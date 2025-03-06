"use client";

import { SignIn } from "@clerk/nextjs";
import HomeHeader from "@/components/reelty/HomeHeader";

export default function SignInPage() {
  return (
    <>
      <HomeHeader />
      <div className='min-h-screen flex items-center justify-center bg-white px-4'>
        <SignIn signUpUrl='/sign-up' />
      </div>
    </>
  );
}
