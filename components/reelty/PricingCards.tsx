"use client";

import { useState } from "react";
import Image from "next/image";

interface PricingCardsProps {
  isModal?: boolean;
}

export default function PricingCards({ isModal = false }: PricingCardsProps) {
  const [billingType, setBillingType] = useState<"credits" | "monthly">(
    "monthly"
  );

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
            <button className='w-full py-3 rounded-lg border text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'>
              Get Started
            </button>
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
            <button className='w-full py-3 rounded-lg bg-white text-black text-[15px] font-semibold hover:bg-white/90'>
              Get Started
            </button>
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
            <button className='w-full py-3 rounded-lg bg-[#1c1c1c] text-white text-[15px] font-semibold hover:bg-black'>
              Get Started
            </button>
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
      <span className={`text-[15px] ${light ? "text-white" : ""}`}>{text}</span>
    </div>
  );
}
