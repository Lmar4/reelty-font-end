"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const isSignIn = view !== "sign_up";
  const { user, signInWithGoogle } = useAuth();
  const convertToListingMutation = trpc.property.convertTempToListing.useMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handlePendingListing = async () => {
      if (user) {
        const pendingSessionId = localStorage.getItem("pendingListingSession");
        if (pendingSessionId) {
          try {
            await convertToListingMutation.mutateAsync({
              userId: user.uid
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
      toast.error("Failed to sign in with Google");
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed in!");
    } catch (error: any) {
      console.error("Failed to sign in:", error);
      toast.error(error.message || "Failed to sign in");
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

          <form onSubmit={handleEmailSignIn} className='space-y-4'>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Your email address'
                className='w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-black/5 outline-none text-[15px]'
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Your password'
                className='w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-black/5 outline-none text-[15px]'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#1c1c1c] text-white py-2.5 rounded-lg hover:bg-[#1c1c1c]/90 transition-colors text-[15px] disabled:opacity-50'
            >
              {isLoading ? "Signing in..." : `Sign ${isSignIn ? "in" : "up"}`}
            </button>
          </form>

          {isSignIn && (
            <div className='text-center'>
              <Link
                href="/reset-password"
                className='text-[14px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
              >
                Forgot your password?
              </Link>
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
              <Link href="/reset-password" className='text-[#1c1c1c] hover:underline'>
                Click Here
              </Link>{" "}
              and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
