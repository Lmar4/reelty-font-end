"use client";

import { SignUp } from "@clerk/nextjs";
import HomeHeader from "@/components/reelty/HomeHeader";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [redirectUrl, setRedirectUrl] = useState<string>("/dashboard");

  useEffect(() => {
    // Get the stored redirect path
    const storedRedirect = sessionStorage?.getItem("postSignUpRedirect");
    if (storedRedirect) {
      setRedirectUrl(storedRedirect);
    }
  }, []);

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
          fallbackRedirectUrl={redirectUrl}
        />
      </div>
    </>
  );
}
