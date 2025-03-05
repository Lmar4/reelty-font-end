"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "PAST_DUE"
  | "TRIALING"
  | "UNPAID"
  | "INACTIVE";

interface PricingCardsProps {
  isModal?: boolean;
  currentTier?: string;
  onUpgradeComplete?: () => void;
  currentStatus?: SubscriptionStatus;
}

// Separate the component logic from the export
function PricingCardsContent({
  isModal = false,
  currentTier,
  onUpgradeComplete,
  currentStatus,
}: PricingCardsProps) {
  console.log("PricingCardsContent rendering");
  const [billingType, setBillingType] = useState<"credits" | "monthly">(
    "monthly"
  );
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { userId, getToken } = useAuth();

  const prices = {
    basic: billingType === "credits" ? 59 : 39,
    pro: billingType === "credits" ? 236 : 129,
    proPlus: billingType === "credits" ? 590 : 249,
  };

  const credits = {
    basic: billingType === "credits" ? 1 : 1,
    pro: billingType === "credits" ? 4 : 4,
    proPlus: billingType === "credits" ? 10 : 10,
  };

  const reelLimits = {
    payg: 3,
    subscription: 6,
  };

  const getPlanName = (plan: string) => {
    if (billingType === "credits") {
      switch (plan) {
        case "basic":
          return "1 Listing";
        case "pro":
          return "4 Listings";
        case "proPlus":
          return "10 Listings";
        default:
          return plan;
      }
    } else {
      switch (plan) {
        case "basic":
          return "Reelty";
        case "pro":
          return "Reelty Pro";
        case "proPlus":
          return "Reelty Pro+";
        default:
          return plan;
      }
    }
  };

  const handleSubscribe = async (plan: string) => {
    try {
      if (!userId) {
        sessionStorage.setItem("postSignUpRedirect", window.location.href);
        router.push(
          "/sign-up?message=Please sign up first to subscribe to a plan"
        );
        return;
      }

      setLoading(plan);
      const token = await getToken();

      // If user is already subscribed and trying to change plan
      if (currentTier && currentStatus === "ACTIVE") {
        const response = await fetch("/api/stripe/update-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            newPlan: getPlanName(plan),
            billingType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update subscription");
        }

        const data = await response.json();
        window.location.href = data.url;
        return;
      }

      // New subscription
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          plan: getPlanName(plan),
          billingType,
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Checkout error details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const { data } = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("Invalid checkout response:", data);
        throw new Error("Invalid checkout session response");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process subscription"
      );
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (plan: string) => {
    if (loading === plan) return "Processing...";
    if (currentTier === plan) return "Current Plan";
    if (currentTier && currentStatus === "ACTIVE") {
      return plan > currentTier ? "Upgrade Plan" : "Downgrade Plan";
    }
    return "Get Started";
  };

  return (
    <div>
      {/* Single Beta Card */}
      <div className='max-w-md mx-auto'>
        <div className='bg-[#1c1c1c] text-white rounded-3xl px-6 py-10'>
          <div className='flex justify-center mb-6'>
            <div className='relative'>
              <Image
                src='/images/logo.svg'
                alt='Reelty Logo'
                width={110}
                height={30}
                className='flex-shrink-0 invert'
              />
              <span className='absolute -top-3 -right-9 text-[15px] font-bold text-white'>
                Beta
              </span>
            </div>
          </div>

          <div className='mb-6 text-center'>
            <div className='text-[52px] font-semibold'>$249</div>
            <Button
              onClick={() => handleSubscribe("beta")}
              disabled={loading === "beta" || currentTier === "beta"}
              className='w-full py-3 rounded-lg bg-white text-black text-[15px] font-semibold hover:bg-white/90'
            >
              {loading === "beta" ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                getButtonText("beta")
              )}
            </Button>
            <div className='text-[13px] text-center text-white/60 mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3'>
            <Feature text='No Watermark' light />
            <Feature text='Pro Templates' light />
            <Feature text='2 Listings / Month' light />
            <Feature text='Up to 20 Photos per Listing' light />
            <Feature text='6 Reels per Listing' light />
            <Feature text='New Templates Monthly' light />
            <Feature text='Exclusive Early Access to New Features' light />
            <Feature text='Early Access to the Reelty Referral Program' light />
          </div>
        </div>
      </div>

      {/* Need More Section */}
      <div className='text-center mt-8'>
        <p className='text-[18px] text-[#6B7280]'>
          Need more?{" "}
          <a
            href='mailto:team@reelty.io'
            className='text-[#1c1c1c] hover:underline'
          >
            Let's talk!
          </a>
        </p>
      </div>
    </div>
  );
}

// Export the component with conditional AuthGuard wrapping
export default function PricingCards(props: PricingCardsProps) {
  // Temporarily return content directly to test if AuthGuard is the issue
  return <PricingCardsContent {...props} />;
}

function Feature({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className='flex items-center gap-3'>
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke={light ? "white" : "#1c1c1c"}
        strokeWidth='1.5'
        className={light ? "" : ""}
      >
        <circle cx='12' cy='12' r='10' />
        <path d='M8 12l3 3 6-6' />
      </svg>
      <span
        className={`text-[13px] sm:text-[15px] ${light ? "text-white" : ""}`}
      >
        {text}
      </span>
    </div>
  );
}
