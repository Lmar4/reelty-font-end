"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { LoadingState } from "@/components/ui/loading-state";

export default function OnboardingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-up");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingState size='lg' />
      </div>
    );
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    return null;
  }

  return <OnboardingFlow />;
}
