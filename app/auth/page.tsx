"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/common/Toast";
import Form, { FormField } from "@/components/common/Form";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  // Get stored listing data if any
  useEffect(() => {
    const storedData = localStorage.getItem("preAuthListingData");
    if (storedData) {
      // Keep it in localStorage until we redirect to dashboard
      console.log("Found stored listing data:", JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = async (data: z.infer<typeof authSchema>) => {
    try {
      setIsLoading(true);
      if (isSignUp) {
        await signUp(data.email, data.password);
        showToast("Account created successfully!", "success");
      } else {
        await signIn(data.email, data.password);
      }
      router.push(returnTo);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Authentication failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push(returnTo);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Google sign-in failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>

        <Form
          schema={authSchema}
          onSubmit={handleSubmit}
          className='mt-8 space-y-6'
        >
          <div className='rounded-md shadow-sm space-y-6'>
            <FormField
              name='email'
              label='Email address'
              type='email'
              placeholder='Email address'
            />
            <FormField
              name='password'
              label='Password'
              type='password'
              placeholder='Password'
            />
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </button>
          </div>

          <div>
            <button
              type='button'
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Continue with Google
            </button>
          </div>
        </Form>

        <div className='text-center'>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className='text-sm text-blue-600 hover:text-blue-500'
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
