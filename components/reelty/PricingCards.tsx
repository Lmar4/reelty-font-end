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
  const router = useRouter();
  const { userId } = useAuth();

  const prices = {
    basic: billingType === "credits" ? 49 : 39,
    pro: billingType === "credits" ? 79 : 149,
    proPlus: billingType === "credits" ? 189 : 299,
  };

  const credits = {
    basic: billingType === "credits" ? 1 : 1,
    pro: billingType === "credits" ? 2 : 5,
    proPlus: billingType === "credits" ? 5 : 12,
  };

  const handleSubscribe = async (plan: string) => {
    try {
      if (!userId) {
        toast.error("Please sign in to subscribe");
        return;
      }

      setLoading(plan);

      // If user is already subscribed and trying to change plan
      if (currentTier && currentStatus === "ACTIVE") {
        const response = await fetch("/api/stripe/update-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            newPlan: plan,
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
        },
        body: JSON.stringify({
          userId,
          plan,
          billingType,
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // If in modal, call the completion handler
      if (isModal && onUpgradeComplete) {
        onUpgradeComplete();
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
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
            className={`px-6 py-2 rounded-full text-[15px] font-medium transition-all ${
              billingType === "credits"
                ? "bg-white text-[#1c1c1c] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            Pay As You Go
          </button>
          <button
            onClick={() => setBillingType("monthly")}
            className={`px-6 py-2 rounded-full text-[15px] font-medium flex items-center gap-2 transition-all ${
              billingType === "monthly"
                ? "bg-white text-[#1c1c1c] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            Monthly
            <span className='px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[13px] rounded-full'>
              Save 20%
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
              <div className='text-[28px] font-black text-[#1c1c1c] tracking-tight'>
                1 Credit
              </div>
            )}
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[52px] font-semibold text-[#1c1c1c]'>
                ${prices.basic}
              </span>
              {billingType === "monthly" && (
                <span className='text-[15px] font-bold text-[#6B7280] mb-3'>
                  /month
                </span>
              )}
            </div>
            <Button
              onClick={() => handleSubscribe("basic")}
              disabled={loading === "basic" || currentTier === "basic"}
              className='w-full py-6 rounded-lg border text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'
            >
              {loading === "basic" ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                getButtonText("basic")
              )}
            </Button>
            <div className='text-[13px] text-center text-[#6B7280] mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3 text-[#1c1c1c]'>
            {billingType === "monthly" && (
              <Feature text={`${credits.basic} Credit per month`} />
            )}
            <Feature text='Up to 20 Photos per Listing' />
            <Feature text='Unlimited Reel Downloads' />
            <Feature text='No Watermark' />
            <Feature text='Access to Premium Templates' />
            {billingType === "monthly" && (
              <>
                <Feature text='Credits Roll Over (up to 3 months)' />
                <Feature text='Priority Support' />
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
                2 Credits
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
              className='w-full py-6 rounded-lg bg-white text-black text-[15px] font-semibold hover:bg-white/90'
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
              <Feature text={`${credits.pro} Credits per month`} light />
            )}
            <Feature text='Up to 20 Photos per Listing' light />
            <Feature text='Unlimited Reel Downloads' light />
            <Feature text='No Watermark' light />
            <Feature text='Access to Premium Templates' light />
            {billingType === "monthly" && (
              <>
                <Feature text='Credits Roll Over (up to 3 months)' light />
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
                5 Credits
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
              className='w-full py-6 rounded-lg bg-[#1c1c1c] text-white text-[15px] font-semibold hover:bg-black'
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
              <Feature text={`${credits.proPlus} Credits per month`} />
            )}
            <Feature text='Up to 20 Photos per Listing' />
            <Feature text='Unlimited Reel Downloads' />
            <Feature text='No Watermark' />
            <Feature text='Access to Premium Templates' />
            {billingType === "monthly" && (
              <>
                <Feature text='Credits Roll Over (up to 3 months)' />
                <Feature text='Priority Support' />
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
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M13.3332 4L5.99984 11.3333L2.6665 8'
          stroke={light ? "#fff" : "#1c1c1c"}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
      <span
        className={`text-[15px] ${light ? "text-white" : "text-[#1c1c1c]"}`}
      >
        {text}
      </span>
    </div>
  );
}
