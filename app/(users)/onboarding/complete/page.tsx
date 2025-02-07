"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CompletePage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          setError("No session ID found");
          setIsVerifying(false);
          return;
        }

        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error("Payment verification failed");
        }

        // Send welcome email via PLUNK
        await fetch("/api/send-welcome-email", {
          method: "POST",
        });

        setIsVerifying(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Card className='p-8 space-y-4'>
          <div className='flex items-center gap-2'>
            <Loader2 className='w-5 h-5 animate-spin' />
            <p>Verifying your subscription...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Card className='p-8 space-y-4'>
          <h2 className='text-xl font-semibold text-red-600'>Error</h2>
          <p className='text-gray-600'>{error}</p>
          <Button onClick={() => router.push("/onboarding")}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Card className='p-8 space-y-6 max-w-md w-full'>
        <h1 className='text-2xl font-bold text-center'>Welcome to Reelty!</h1>
        <p className='text-gray-600 text-center'>
          Your subscription has been confirmed and your account is ready to use.
          We've sent you a welcome email with important information to get
          started.
        </p>
        <Button onClick={() => router.push("/dashboard")} className='w-full'>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}
