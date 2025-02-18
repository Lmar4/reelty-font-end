"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

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

export default function PricingCards({
  isModal = false,
  currentTier,
  onUpgradeComplete,
  currentStatus,
}: PricingCardsProps) {
  const [billingType, setBillingType] = useState<"credits" | "monthly">(
    "monthly"
  );
  const [loading, setLoading] = useState<string | null>(null);

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
        toast.error("Please sign in to subscribe");
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
      {/* Billing Toggle */}
      <div className='flex justify-center mb-12'>
        <div className='bg-[#F3F4F6] rounded-full p-1 inline-flex'>
          <button
            onClick={() => setBillingType("credits")}
            className={`px-4 sm:px-6 py-2 rounded-full text-[13px] sm:text-[15px] font-medium transition-all ${
              billingType === "credits"
                ? "bg-white text-[#1c1c1c] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            Pay As You Go
          </button>
          <button
            onClick={() => setBillingType("monthly")}
            className={`px-4 sm:px-6 py-2 rounded-full text-[13px] sm:text-[15px] font-medium flex items-center gap-2 transition-all ${
              billingType === "monthly"
                ? "bg-white text-[#1c1c1c] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            Monthly
            <span className='px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[11px] sm:text-[13px] rounded-full'>
              Save 34%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        {/* Basic Plan */}
        <div className='bg-white rounded-3xl px-6 py-10 border'>
          <div className='flex justify-center mb-6'>
            {billingType === "monthly" ? (
              <Image
                src='/images/logo.svg'
                alt='Reelty Logo'
                width={110}
                height={30}
                className='flex-shrink-0'
              />
            ) : (
              <div className='text-[24px] sm:text-[28px] font-black text-[#1c1c1c] tracking-tight'>
                1 Listing
              </div>
            )}
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[42px] sm:text-[52px] font-semibold text-[#1c1c1c]'>
                ${prices.basic}
              </span>
              {billingType === "monthly" && (
                <span className='text-[13px] sm:text-[15px] font-bold text-[#6B7280] mb-3'>
                  /month
                </span>
              )}
            </div>
            <Button
              onClick={() => handleSubscribe("basic")}
              disabled={loading === "basic" || currentTier === "basic"}
              className='w-full py-3 rounded-lg bg-white border border-[#e5e7eb] text-[13px] sm:text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#fafafa] hover:border-[#e5e7eb] transition-colors shadow-none'
            >
              {loading === "basic" ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                getButtonText("basic")
              )}
            </Button>
            <div className='text-[11px] sm:text-[13px] text-center text-[#6B7280] mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3 text-[#1c1c1c]'>
            {billingType === "monthly" && (
              <Feature text={`${credits.basic} Listing per month`} />
            )}
            <Feature text='Up to 20 Photos per Listing' />
            <Feature
              text={`${
                billingType === "monthly"
                  ? reelLimits.subscription
                  : reelLimits.payg
              } Reels per Listing`}
            />
            <Feature text='No Watermark' />
            {billingType === "monthly" && (
              <>
                <Feature text='Premium Templates' />
                <Feature text='Listings Roll Over (up to 3 months)' />
              </>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div className='bg-[#1c1c1c] text-white rounded-3xl px-6 py-10'>
          <div className='flex justify-center mb-6'>
            {billingType === "monthly" ? (
              <div className='relative'>
                <Image
                  src='/images/logo.svg'
                  alt='Reelty Logo'
                  width={110}
                  height={30}
                  className='flex-shrink-0 invert'
                />
                <span className='absolute -top-3 -right-8 text-[15px] font-bold text-white'>
                  Pro
                </span>
              </div>
            ) : (
              <div className='text-[28px] font-black text-white tracking-tight'>
                4 Listings
              </div>
            )}
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[52px] font-semibold'>${prices.pro}</span>
              {billingType === "monthly" && (
                <span className='text-[15px] font-bold text-white/60 mb-3'>
                  /month
                </span>
              )}
            </div>
            <Button
              onClick={() => handleSubscribe("pro")}
              disabled={loading === "pro" || currentTier === "pro"}
              className='w-full py-3 rounded-lg bg-white text-black text-[15px] font-semibold hover:bg-white/90'
            >
              {loading === "pro" ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                getButtonText("pro")
              )}
            </Button>
            <div className='text-[13px] text-center text-white/60 mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3'>
            {billingType === "monthly" && (
              <Feature text={`${credits.pro} Listings per month`} light />
            )}
            <Feature text='Up to 20 Photos per Listing' light />
            <Feature
              text={`${
                billingType === "monthly"
                  ? reelLimits.subscription
                  : reelLimits.payg
              } Reels per Listing`}
              light
            />
            <Feature text='No Watermark' light />
            {billingType === "monthly" && (
              <>
                <Feature text='Premium Templates' light />
                <Feature text='Listings Roll Over (up to 6 months)' light />
                <Feature text='Priority Support' light />
              </>
            )}
          </div>
        </div>

        {/* Pro+ Plan */}
        <div className='bg-[#F3F4F6] rounded-3xl px-6 py-10'>
          <div className='flex justify-center mb-6'>
            {billingType === "monthly" ? (
              <div className='relative'>
                <Image
                  src='/images/logo.svg'
                  alt='Reelty Logo'
                  width={110}
                  height={30}
                  className='flex-shrink-0'
                />
                <span className='absolute -top-3 -right-10 text-[15px] font-bold text-[#1c1c1c]'>
                  Pro+
                </span>
              </div>
            ) : (
              <div className='text-[28px] font-black text-[#1c1c1c] tracking-tight'>
                10 Listings
              </div>
            )}
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[52px] font-semibold text-[#1c1c1c]'>
                ${prices.proPlus}
              </span>
              {billingType === "monthly" && (
                <span className='text-[15px] font-bold text-[#6B7280] mb-3'>
                  /month
                </span>
              )}
            </div>
            <Button
              onClick={() => handleSubscribe("proPlus")}
              disabled={loading === "proPlus" || currentTier === "proPlus"}
              className='w-full py-3 rounded-lg bg-[#1c1c1c] text-white text-[15px] font-semibold hover:bg-black'
            >
              {loading === "proPlus" ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                getButtonText("proPlus")
              )}
            </Button>
            <div className='text-[13px] text-center text-[#6B7280] mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3 text-[#1c1c1c]'>
            {billingType === "monthly" && (
              <Feature text={`${credits.proPlus} Listings per month`} />
            )}
            <Feature text='Up to 20 Photos per Listing' />
            <Feature
              text={`${
                billingType === "monthly"
                  ? reelLimits.subscription
                  : reelLimits.payg
              } Reels per Listing`}
            />
            <Feature text='No Watermark' />
            {billingType === "monthly" && (
              <>
                <Feature text='Premium Templates' />
                <Feature text='Listings Roll Over (unlimited)' />
                <Feature text='Priority Support' />
                <Feature text='Dedicated Account Manager' />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Need More Section */}
      <div className='text-center'>
        <p className='text-[18px] text-[#6B7280]'>
          Need more?{" "}
          <a
            href='mailto:support@reelty.com'
            className='text-[#1c1c1c] hover:underline'
          >
            Let's talk!
          </a>
        </p>
      </div>
    </div>
  );
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
