"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!isSignInLoaded && !isSignUpMode) || (!isSignUpLoaded && isSignUpMode))
      return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      setIsLoading(true);
      const data = authSchema.parse({ email, password });

      if (isSignUpMode && signUp) {
        const result = await signUp.create({
          emailAddress: data.email,
          password: data.password,
        });

        if (result.status === "complete") {
          toast.success("Account created successfully!");
          router.push(returnTo);
        } else {
          console.error("Sign up failed:", result);
          toast.error("Failed to create account");
        }
      } else if (!isSignUpMode && signIn) {
        const result = await signIn.create({
          identifier: data.email,
          password: data.password,
        });

        if (result.status === "complete") {
          router.push(returnTo);
        } else {
          console.error("Sign in failed:", result);
          toast.error("Failed to sign in");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          isSignUpMode ? "Failed to create account" : "Failed to sign in"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            {isSignUpMode ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <div className='rounded-md shadow-sm space-y-4'>
            <div>
              <Label htmlFor='email'>Email address</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                className='mt-1'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                className='mt-1'
                placeholder='Enter your password'
              />
            </div>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading || (!isSignInLoaded && !isSignUpLoaded)}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isSignUpMode ? "Creating account..." : "Signing in..."}
              </>
            ) : (
              <>{isSignUpMode ? "Create Account" : "Sign In"}</>
            )}
          </Button>

          <div className='text-center'>
            <button
              type='button'
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className='text-sm text-blue-600 hover:text-blue-500'
            >
              {isSignUpMode
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
