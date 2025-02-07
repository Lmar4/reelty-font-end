"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function RecoveryPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !code) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className='w-full max-w-[400px] space-y-6'>
          <div className='text-center'>
            <h1 className='text-[32px] md:text-[40px] font-bold text-[#1c1c1c]'>
              Reset Password
            </h1>
            <p className='mt-2 text-[15px] text-[#6B7280]'>
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='password'
                className='block text-[15px] text-[#6B7280] mb-1'
              >
                New Password
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter new password'
                className='w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-black/5 outline-none text-[15px]'
                required
              />
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-[15px] text-[#6B7280] mb-1'
              >
                Confirm Password
              </label>
              <input
                type='password'
                id='confirmPassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm new password'
                className='w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-black/5 outline-none text-[15px]'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#1c1c1c] text-white py-2.5 rounded-lg hover:bg-[#1c1c1c]/90 transition-colors text-[15px] disabled:opacity-50'
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className='text-center text-[14px] text-[#1c1c1c]/60'>
            Remember your password?{" "}
            <Link href='/login' className='text-[#1c1c1c] hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
