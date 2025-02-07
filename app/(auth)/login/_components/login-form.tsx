"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export function LoginForm() {
  return (
    <div className='min-h-screen flex flex-col bg-white px-4'>
      {/* Centered Logo */}
      <div className='pt-6 pb-24 md:pb-32 flex justify-center'>
        <Link href='/' className='flex items-center'>
          <Image
            src='/images/logo.svg'
            alt='Reelty Logo'
            width={100}
            height={27}
            className='flex-shrink-0 w-[90px] md:w-[120px] h-auto'
          />
        </Link>
      </div>

      {/* Center the form content */}
      <div className='flex-1 flex flex-col items-center'>
        <div className='w-full max-w-[400px]'>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-[#1c1c1c] hover:bg-[#1c1c1c]/90",
                card: "shadow-none",
                headerTitle:
                  "text-[32px] md:text-[40px] font-bold text-center text-[#1c1c1c]",
                headerSubtitle: "text-center text-[14px] text-[#1c1c1c]/60",
                socialButtonsBlockButton:
                  "bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/90",
                formFieldInput:
                  "rounded-lg border focus:ring-2 focus:ring-black/5",
                footerActionLink: "text-[#1c1c1c] hover:text-[#1c1c1c]/90",
              },
            }}
            fallbackRedirectUrl='/dashboard'
            routing='path'
            path='/login'
            signUpUrl='/sign-up'
          />
        </div>

        <p className='mt-6 text-center text-[14px] text-[#1c1c1c]/60'>
          By continuing, I agree to the{" "}
          <Link href='/terms' className='hover:underline'>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href='/privacy' className='hover:underline'>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
