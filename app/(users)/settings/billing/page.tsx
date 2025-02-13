"use client";

import { useState } from "react";
import PricingModal from "@/components/reelty/PricingModal";

export default function BillingSettings() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <h1 className="text-[32px] font-semibold text-[#1c1c1c] mb-12">Billing</h1>

      {/* Current Plans Section */}
      <div className="mb-16">
        <h2 className="text-[22px] font-semibold text-[#1c1c1c] mb-6">Current plans</h2>
        <button 
          onClick={() => setIsPricingOpen(true)}
          className="bg-[#1c1c1c] text-white px-6 py-3 rounded-full text-[15px] font-semibold"
        >
          Choose a plan
        </button>
      </div>

      {/* Invoices Section */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#1c1c1c] mb-6">Invoices</h2>
        <div className="text-[15px] text-[#6B7280]">
          No invoices.
        </div>
      </div>

      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        listingId=''
        onUpgradeComplete={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
