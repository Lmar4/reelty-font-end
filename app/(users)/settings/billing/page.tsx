"use client";

import { useState } from "react";
import PricingModal from "@/components/reelty/PricingModal";
import CreditPackages from "@/components/reelty/CreditPackages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BillingSettings() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Billing & Credits</h1>
        <p className='text-muted-foreground'>
          Manage your subscription, credits, and view payment history.
        </p>
      </div>

      <Tabs defaultValue='subscription' className='space-y-8'>
        <TabsList>
          <TabsTrigger value='subscription'>Subscription</TabsTrigger>
          <TabsTrigger value='credits'>Credits</TabsTrigger>
        </TabsList>

        <TabsContent value='subscription'>
          {/* Current Plans Section */}
          <div className='mb-8'>
            <h2 className='text-lg font-semibold mb-4'>Current Plan</h2>
            <button
              onClick={() => setIsPricingOpen(true)}
              className='bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors'
            >
              Choose a plan
            </button>
          </div>

          {/* Invoices Section */}
          <div>
            <h2 className='text-lg font-semibold mb-4'>Invoices</h2>
            <div className='text-sm text-muted-foreground'>No invoices.</div>
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
  );
}
