"use client";

import { useState } from "react";
import Image from "next/image";

interface PricingCardsProps {
  isModal?: boolean;
}

export default function PricingCards({ isModal = false }: PricingCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const prices = {
    basic: billingPeriod === "monthly" ? 29 : 290,
    pro: billingPeriod === "monthly" ? 79 : 790,
    proPlus: billingPeriod === "monthly" ? 189 : 1890,
  };

  return (
    <div>
      {/* Billing Toggle */}
      <div className='flex justify-center mb-12'>
        <div className='bg-[#F3F4F6] rounded-full p-1 inline-flex'>
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-full text-[15px] font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-white text-[#1c1c1c] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-6 py-2 rounded-full text-[15px] font-medium flex items-center gap-2 transition-all ${
              billingPeriod === "yearly"
                ? "bg-white text-[#1c1c1c] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            Yearly
            <span className='px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[13px] rounded-full'>
              Save $190
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        {/* Basic Plan */}
        <div className='bg-white rounded-3xl px-6 py-10 border'>
          <div className='flex justify-center mb-6'>
            <Image
              src='/images/logo.svg'
              alt='Reelty Logo'
              width={110}
              height={30}
              className='flex-shrink-0'
            />
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[52px] font-semibold text-[#1c1c1c]'>
                ${prices.basic}
              </span>
              <span className='text-[15px] font-bold text-[#6B7280] mb-3'>
                /{billingPeriod === "monthly" ? "month" : "year"}
              </span>
            </div>
            <button className='w-full py-3 rounded-lg border text-[15px] font-semibold text-[#1c1c1c] hover:bg-[#f7f7f7]'>
              Get Started
            </button>
            <div className='text-[13px] text-center text-[#6B7280] mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3 text-[#1c1c1c]'>
            <Feature text='Upload 10 videos monthly' />
            <Feature text='Up to 45 minutes long videos' />
            <Feature text='Generate 100 clips monthly' />
            <Feature text='HD download' />
          </div>
        </div>

        {/* Pro Plan */}
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
              <span className='absolute -top-3 -right-8 text-[15px] font-bold text-white'>
                Pro
              </span>
            </div>
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[52px] font-semibold'>${prices.pro}</span>
              <span className='text-[15px] font-bold text-white/60 mb-3'>
                /{billingPeriod === "monthly" ? "month" : "year"}
              </span>
            </div>
            <button className='w-full py-3 rounded-lg bg-white text-black text-[15px] font-semibold hover:bg-white/90'>
              Get Started
            </button>
            <div className='text-[13px] text-center text-white/60 mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3'>
            <Feature text='Upload 30 videos monthly' light />
            <Feature text='Up to 2 hours long videos' light />
            <Feature text='Generate 300 clips monthly' light />
            <Feature text='4K download' light />
            <Feature text='Translate to 29 languages (AI Dubbing)' light />
          </div>
        </div>

        {/* Pro+ Plan */}
        <div className='bg-[#F3F4F6] rounded-3xl px-6 py-10'>
          <div className='flex justify-center mb-6'>
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
          </div>

          <div className='mb-6 text-center'>
            <div className='flex items-end gap-1 mb-6 justify-center'>
              <span className='text-[52px] font-semibold text-[#1c1c1c]'>
                ${prices.proPlus}
              </span>
              <span className='text-[15px] font-bold text-[#6B7280] mb-3'>
                /{billingPeriod === "monthly" ? "month" : "year"}
              </span>
            </div>
            <button className='w-full py-3 rounded-lg bg-[#1c1c1c] text-white text-[15px] font-semibold hover:bg-black'>
              Get Started
            </button>
            <div className='text-[13px] text-center text-[#6B7280] mt-2'>
              Secured by Stripe
            </div>
          </div>

          <div className='space-y-3 text-[#1c1c1c]'>
            <Feature text='Upload 100 videos monthly' />
            <Feature text='Up to 3 hours long videos' />
            <Feature text='Generate 1000 clips monthly' />
            <Feature text='4K download' />
            <Feature text='Translate to 29 languages (AI Dubbing)' />
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
