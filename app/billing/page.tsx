"use client";
import { useState } from "react";

import DashboardLayout from "@/components/reelty/DashboardLayout";
import PricingModal from "@/components/reelty/PricingModal";
import CreditPackages from "@/components/reelty/CreditPackages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Billing() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-16'>
        <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
          Billing & Credits
        </h1>

        <Tabs defaultValue='subscription' className='space-y-8'>
          <TabsList>
            <TabsTrigger value='subscription'>Subscription</TabsTrigger>
            <TabsTrigger value='credits'>Credits</TabsTrigger>
          </TabsList>

          <TabsContent value='subscription'>
            {/* Current Plans Section */}
            <div className='mb-16'>
              <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
                Current plans
              </h2>
              <button
                onClick={() => setIsPricingOpen(true)}
                className='bg-[#1c1c1c] text-white px-6 py-3 rounded-full text-[15px] font-semibold'
              >
                Choose a plan
              </button>
            </div>

            {/* Invoices Section */}
            <div>
              <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
                Invoices
              </h2>
              <div className='text-[15px] text-[#6B7280]'>No invoices.</div>
            </div>
          </TabsContent>

          <TabsContent value='credits'>
            <CreditPackages />
          </TabsContent>
        </Tabs>

        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
