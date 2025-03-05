"use client";

import { useRouter } from "next/navigation";

export default function FreeTrial() {
  const router = useRouter();

  return (
    <div className='w-full'>
      <div className='bg-[#1c1c1c] text-white px-4 py-2 text-[14px] flex items-center justify-between'>
        <div>
          <span className='text-white font-semibold'>
            You're in a free trial.
          </span>{" "}
          <span className='text-white/40'>
            Some features are limited. Upgrade to unlock.
          </span>
        </div>
        <button
          onClick={() => router.push("/pricing")}
          className='bg-white text-black px-4 py-1 rounded-lg text-[15px] font-semibold'
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}
