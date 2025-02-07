"use client";

import { DashboardUpload } from "@/components/reelty/DashboardUpload";
import { ListingsGrid } from "@/components/reelty/ListingsGrid";
import Link from "next/link";

export default function ListingsPage() {
  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
      {/* Header Section */}
      <div className='mb-8'>
        <Link
          href='/dashboard'
          className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 mb-2 block'
        >
          Dashboard
        </Link>
        <div className='space-y-4'>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c]'>
            Your Listings
          </h1>
          <div className='max-w-2xl'>
            <p className='text-[#1c1c1c]/60 text-lg'>
              Create stunning video reels for your real estate listings. Simply
              upload photos of your property, and we'll generate professional
              video content automatically.
            </p>
            <div className='mt-4 flex flex-col gap-2 text-[#1c1c1c]/60'>
              <p className='flex items-center gap-2'>
                <span className='font-semibold'>1.</span>
                Click the "Create new listing Reels" button below
              </p>
              <p className='flex items-center gap-2'>
                <span className='font-semibold'>2.</span>
                Upload photos of your property
              </p>
              <p className='flex items-center gap-2'>
                <span className='font-semibold'>3.</span>
                Fill in the property details
              </p>
              <p className='flex items-center gap-2'>
                <span className='font-semibold'>4.</span>
                We'll generate your video reels automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <DashboardUpload />

      {/* Listings Section */}
      <ListingsGrid />
    </div>
  );
}
