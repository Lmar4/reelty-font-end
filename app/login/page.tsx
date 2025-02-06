"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const isSignIn = view !== "sign_up";
  const { user, signInWithGoogle } = useAuth();
  const convertToListingMutation =
    trpc.property.convertTempToListing.useMutation();

  useEffect(() => {
    const handlePendingListing = async () => {
      if (user) {
        const pendingSessionId = localStorage.getItem("pendingListingSession");
        if (pendingSessionId) {
          try {
            await convertToListingMutation.mutateAsync({
              sessionId: pendingSessionId,
              userId: user.uid,
            });
            localStorage.removeItem("pendingListingSession");
            router.push("/dashboard");
          } catch (error) {
            console.error("Error converting pending listing:", error);
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      }
    };

    handlePendingListing();
  }, [user, router, convertToListingMutation]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  return (
    <>
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
          {/* Form Container */}
          <div className='w-full max-w-[400px] space-y-6'>
            <h1 className='text-[32px] md:text-[40px] font-bold text-center text-[#1c1c1c]'>
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>

            {/* Google button with colored logo */}
            <button
              onClick={handleGoogleSignIn}
              className='w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#1c1c1c] text-white rounded-lg hover:bg-[#1c1c1c]/90 transition-colors'
            >
              <Image src='/google.svg' alt='Google' width={20} height={20} />
              <span className='text-[15px]'>
                Sign {isSignIn ? "in" : "up"} with Google
              </span>
            </button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>
                  or continue with email
                </span>
              </div>
            </div>

            <form className='space-y-4'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-[15px] text-[#6B7280] mb-1'
                >
                  Email address
                </label>
                <input
                  type='email'
                  id='email'
                  placeholder='Your email address'
                  className='w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-black/5 outline-none text-[15px]'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-[15px] text-[#6B7280] mb-1'
                >
                  Your Password
                </label>
                <input
                  type='password'
                  id='password'
                  placeholder='Your password'
                  className='w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-black/5 outline-none text-[15px]'
                />
              </div>

              <button
                type='submit'
                className='w-full bg-[#1c1c1c] text-white py-2.5 rounded-lg hover:bg-[#1c1c1c]/90 transition-colors text-[15px]'
              >
                Sign {isSignIn ? "in" : "up"}
              </button>
            </form>

            {isSignIn && (
              <div className='text-center'>
                <button
                  type='button'
                  className='text-[14px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <p className='text-center text-[14px] text-[#1c1c1c]/60'>
              {isSignIn
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                href={`/login?view=${isSignIn ? "sign_up" : "sign_in"}`}
                className='text-[#1c1c1c] hover:underline'
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </Link>
            </p>

            <p className='text-center text-[14px] text-[#1c1c1c]/60'>
              By continuing, I agree to the{" "}
              <Link href='/terms' className='hover:underline'>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href='/privacy' className='hover:underline'>
                Privacy Policy
              </Link>
            </p>

            {isSignIn && (
              <p className='text-center text-[14px] text-[#1c1c1c]/60'>
                Having trouble logging in?{" "}
                <button className='text-[#1c1c1c] hover:underline'>
                  Click Here
                </button>{" "}
                and try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
