"use client";

import { SignUp } from "@clerk/nextjs";
import HomeHeader from "@/components/reelty/HomeHeader";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SignUpPage() {
  const [redirectUrl, setRedirectUrl] = useState<string>("/dashboard");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the stored redirect path
    const storedRedirect = sessionStorage?.getItem("postSignUpRedirect");
    if (storedRedirect) {
      setRedirectUrl(storedRedirect);
    }
  }, []);

  useEffect(() => {
    const message = searchParams.get("message");
    // Create a flag to track if toast was shown
    let isToastShown = false;

    if (message && !isToastShown) {
      toast.info(message);
      isToastShown = true;
    }

    // Cleanup function
    return () => {
      isToastShown = false;
    };
  }, [searchParams]);

  return (
    <>
      <HomeHeader />
      <div className='min-h-screen flex items-center justify-center bg-white px-4'>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
          routing='path'
          path='/sign-up'
          signInUrl='/login'
          fallbackRedirectUrl={redirectUrl}
        />
      </div>
    </>
  );
}
